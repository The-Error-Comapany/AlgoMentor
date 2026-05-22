"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token and fetch user on app start
  useEffect(() => {
    const fetchUser = async (token) => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.status === 401) {
          localStorage.removeItem("accessToken");
          setAccessToken(null);
          setUser(null);
        } else {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem("accessToken");
            setAccessToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Failed to load user profile on startup:", err);
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("accessToken");
    if (token) {
      setAccessToken(token);
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token) => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching user data during login:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        setUser,
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
