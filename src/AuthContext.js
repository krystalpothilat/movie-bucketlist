import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('isAuthenticated');
    });
    const [isAdmin, setIsAdmin] = useState(() => {
        // Check local storage or session for admin status if applicable
        return localStorage.getItem('isAdmin') === 'true';
    });

    const login = (username, password) => {
        if (username === 'admin' && password === 'password') {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('isAdmin', 'true');
            setIsAuthenticated(true);
            setIsAdmin(true);
        } else {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.removeItem('isAdmin');
            setIsAuthenticated(true);
            setIsAdmin(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('isAdmin');
        setIsAuthenticated(false);
        setIsAdmin(false);
    };

    useEffect(() => {
        setIsAuthenticated(!!localStorage.getItem('isAuthenticated'));
        setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
  );
};
