import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Optional: show loading state
  const [selectedBranch, setSelectedBranch] = useState(user?.users_branch?.[0] || null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }

    // Load selected branch from localStorage
    const storedBranch = localStorage.getItem("selected_branch");
    if (storedBranch) {
      try {
        setSelectedBranch(JSON.parse(storedBranch));
      } catch {
        localStorage.removeItem("selected_branch");
      }
    }
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem("selected_branch", JSON.stringify(selectedBranch));
    }
  }, [selectedBranch]);


  const login = async (email, password) => {
    try {
      const response = await api.post("/api/login", { email, password });
      const { access_token } = response.data;

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

      // Only set branch if not already set (e.g., from localStorage)
      setSelectedBranch((prev) => {
        if (prev) return prev;
        return response.data.data.users_branch?.[0] || null;
      });
    } catch (err) {
      console.error("Fetch user error:", err.response?.data || err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await api.post("/api/clear-cache");
      alert(res.data.message);
    } catch (err) {
      alert("Failed to clear cache");
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("selected_branch");
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
    <AuthContext.Provider
      value={{
        user, setUser, login, logout, loading, fetchUser, handleClearCache,
        selectedBranch,
        setSelectedBranch,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
