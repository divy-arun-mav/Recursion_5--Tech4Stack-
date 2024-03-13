import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { backend_api } from './url';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [person, setPerson] = useState('Student');
    const [loggedUser, setcurrentUser] = useState('');
    const isLoggedIn = !!token;

    useEffect(() => {
        const ls = localStorage.getItem('USER');
        if (ls) {
            const parsedUser = JSON.parse(ls);
            setcurrentUser(parsedUser);
        } else {
            console.log('Please Login First');
        }
    }, []);

    const storeTokenInLS = (serverToken) => {
        setToken(serverToken);
        localStorage.setItem('token', serverToken);
    };

    const LogoutUser = () => {
        setToken('');
        localStorage.removeItem('token');
        localStorage.removeItem('USER');
    };

    const userAuthentication = useCallback(async () => {
        if (!token || !loggedUser || !loggedUser.user) {
            console.error('Invalid token or user information');
            return;
        }

        try {
            const response = await fetch(`${backend_api}/${loggedUser.user}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('Server returned an error:', response.status, response.statusText);
                return;
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Response is not JSON');
                return;
            }

            const data = await response.json();
            if (data.msg) {
                localStorage.setItem('USER', JSON.stringify(data.msg));
            } else {
                console.error('Unexpected API response format:', data);
            }
        } catch (error) {
            console.error('Error during user authentication:', error);
        }
    }, [token, loggedUser]);

    const getClassData = useCallback(async () => {
        
    },[]);

    useEffect(() => {
        const authenticateUser = async () => {
            if (token) {
                await userAuthentication();
            }
        };

        authenticateUser();
    }, [token, userAuthentication]);

    return (
        <AuthContext.Provider
            value={{ isLoggedIn, storeTokenInLS, LogoutUser, token, setPerson, person, backend_api, loggedUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error('useAuth used outside of the Provider');
    }
    return authContextValue;
};
