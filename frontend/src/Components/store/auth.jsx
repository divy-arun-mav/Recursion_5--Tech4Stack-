import { createContext, useContext, useState } from "react";
// import { ethers } from "ethers";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [address, setAddress] = useState(null);

    const [isloggedin, setIsloggedIn] = useState(false);
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

   
    return (
        <AuthContext.Provider value={{ address, connectWallet, isloggedin,setIsloggedIn}}>
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