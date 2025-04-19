import React, { createContext, useContext, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/login", { email, password });
      const { access_token, user } = response.data;

      localStorage.setItem("access_token", access_token);
      setUser(user);

      return { success: true };
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      return { success: false, message: err.response?.data?.message || "Login failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
