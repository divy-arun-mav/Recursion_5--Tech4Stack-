import { createContext, useContext, useState, useEffect } from "react";
// import { ethers } from "ethers";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [address, setAddress] = useState(null);
    const [token,setToken] = useState('');
    const [user,setUser] = useState('');
    let isLoggedIn = !!token;

    const connectWallet = async () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const account = await ethereum.request({
                    method: "eth_requestAccounts",
                });
                window.ethereum.on("chainChanged", () => {
                    window.location.reload();
                });

                window.ethereum.on("accountsChanged", () => {
                    window.location.reload();
                });
                setAddress(account[0]);
            }
            else {
                alert('Please install and log in to Metamask wallet to initiate the transaction.');
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("An error occurred while connecting to the wallet. Please try again.");
        }
    }

    useEffect(() => {
        const ls = localStorage.getItem("USER");
        if (ls) {
            const parsedUser = JSON.parse(ls);
            setUser(parsedUser);
        } else {
            console.log("Please Login First");
        }
    }, []);


    const storeTokenInLS = (serverToken) => {
        setToken(serverToken);
        localStorage.setItem("token", serverToken);
    };

    const LogoutUser = () => {
        setToken("");
        localStorage.removeItem("token");
        localStorage.removeItem("USER");
    }

    const userAuthentication = async () => {
        let response;
        try {
            response = await fetch("http://localhost:8000/user", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status !== 200) {
                console.error("Server returned an error:", response.status, response.statusText);
            }

            const data = await response.json();

            if (data.msg) {
                localStorage.setItem("USER", JSON.stringify(data.msg));
            } else {
                console.error("Unexpected API response format:", data);
            }
        } catch (error) {
            console.error("Error during user authentication:", error);
        }
    };


    useEffect(() => {
        const authenticateUser = async () => {
            if (token) {
                await userAuthentication();
            }
        };
        connectWallet();
        authenticateUser();
    }, [token, userAuthentication]);


    return (
        <AuthContext.Provider value={{ address, connectWallet, isLoggedIn,LogoutUser,storeTokenInLS,user,setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth used outside of the Provider");
    }
    return authContextValue;
};