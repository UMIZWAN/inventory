import React, { useEffect, useState } from 'react';
import { IoIosNotificationsOutline, IoMdLogOut } from "react-icons/io";
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { router } from "@inertiajs/react";
import { Link } from '@inertiajs/react';
import { FiRepeat } from "react-icons/fi";

const Layout = ({ children }) => {
    const { user, logout, selectedBranch, setSelectedBranch } = useAuth();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-[236px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col gap-4 px-3 py-4">
                {/* Brand + clock */}
                <div>
                    <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-gray-900">MIS</h1>
                    <p className="text-xs text-indigo-800 mt-0.5">
                        {now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}
                        {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                </div>

                {/* Branch selector */}
                {user && (
                    <div>
                        <label className="block text-[11px] uppercase tracking-[0.06em] text-gray-500 mb-1.5">Branch</label>
                        <select
                            value={selectedBranch?.branch_id || ''}
                            onChange={(e) => {
                                const selected = user.users_branch.find(b => b.branch_id == e.target.value);
                                setSelectedBranch(selected);
                            }}
                            className="w-full min-h-[34px] border border-gray-200 rounded-lg px-2 py-1 text-[13px] text-gray-800 bg-transparent focus:outline-none focus:border-indigo-500"
                        >
                            {user.users_branch.map(branch => (
                                <option key={branch.branch_id} value={branch.branch_id}>
                                    {branch.branch_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Navigation (scrollable) */}
                <div className="flex-1 overflow-y-auto -mx-1 px-1">
                    <Sidebar />
                </div>

                {/* User + logout (pinned bottom) */}
                {user && (
                    <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-2">
                        <Link href="/profile" className="min-w-0">
                            <span className="text-[13px] font-medium text-indigo-800 hover:underline break-words">
                                {user.name}
                            </span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            aria-label="Logout"
                            className="flex-shrink-0 border border-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-50 hover:text-gray-900"
                        >
                            <IoMdLogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </aside>

            {/* Page Content */}
            <main className="flex-1 p-3 overflow-y-scroll bg-white">
                {children}
            </main>
        </div>
    );
};

export default Layout;
