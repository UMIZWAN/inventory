import React, { useEffect } from 'react';
import { IoIosNotificationsOutline, IoMdLogOut } from "react-icons/io";
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { router } from "@inertiajs/react";
import { Link } from '@inertiajs/react';
import { FiRepeat } from "react-icons/fi";

const Layout = ({ children }) => {
    const { user, logout, selectedBranch, setSelectedBranch } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const isLoginPage = window.location.pathname === '/';
        if (!token && !isLoginPage) {
            window.location.href = '/';
        }
    }, []);

    const handleLogout = () => {
        logout();
        router.visit('/');
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Topbar */}
            <header className="bg-white px-6 py-4 shadow-md flex justify-between items-center">
                <h1 className="text-lg font-bold">Marketing Inventory System</h1>
                {user && (
                    <div className="flex items-center gap-4">
                        <select
                            value={selectedBranch?.branch_id || ''}
                            onChange={(e) => {
                                const selected = user.users_branch.find(b => b.branch_id == e.target.value);
                                setSelectedBranch(selected);
                            }}
                            className="border rounded px-2 py-1 text-sm shadow-sm"
                        >
                            {user.users_branch.map(branch => (
                                <option key={branch.branch_id} value={branch.branch_id}>
                                    {branch.branch_name}
                                </option>
                            ))}
                        </select>

                        <Link href="/profile" className="flex items-center gap-2">
                            <span className="text-gray-600 hover:text-blue-600 hover:underline">{user.name}</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="bg-white text-red-600 shadow-sm shadow-red-600/50 px-2 py-1 rounded hover:bg-red-100"
                        >
                            <IoMdLogOut className="inline-block mr-1 mb-1" />
                            Logout
                        </button>
                    </div>
                )}

            </header>

            {/* Main layout container */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-gray-100 overflow-y-auto">
                    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300">
                        <Sidebar />
                    </div>
                </aside>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
