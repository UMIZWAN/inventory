import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { router } from "@inertiajs/react";

const Layout = ({ children }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.visit("/");
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Topbar */}
            <header className="bg-white px-6 py-4 shadow-md flex justify-between items-center">
                <h1 className="text-lg font-bold">Inventory System</h1>
                {user && (
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Hi, {user.name}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </header>

            {/* Main layout container */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-gray-50 overflow-y-auto">
                    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300">
                        <Sidebar />
                    </div>
                </aside>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
