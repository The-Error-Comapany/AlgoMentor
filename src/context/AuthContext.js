"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token on app start
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAccessToken(token);
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated: !!accessToken,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
