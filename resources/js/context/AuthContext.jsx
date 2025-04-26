import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Optional: show loading state

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/login", { email, password });
      const { access_token } = response.data;
      console.log("User data:", response.data);

      localStorage.setItem("access_token", access_token);

      await fetchUser(); // Fetch user detail after login

      return { success: true };
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  const fetchUser = async () => {
    try {
      const response = await api.get("/api/profile");
      setUser(response.data.data);
    } catch (err) {
      console.error("Fetch user error:", err.response?.data || err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  // Auto-fetch user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
