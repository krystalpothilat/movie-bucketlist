import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });

  const login = () => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('isAdmin', 'true');

    setIsAuthenticated(true);
    setIsAdmin(true);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');

    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');

    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
