import axios from "axios";
import { router } from "@inertiajs/react";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Add token to request headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token expiration (unauthorized response)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("access_token");
            router.visit('/');
        }
        return Promise.reject(error);
    }
);

export default api;
