import React from "react";
import { FiMenu, FiSearch, FiSettings, FiMoon, FiMaximize } from 'react-icons/fi';

function Topbar() {
    return (
        <header className="bg-white shadow-sm">
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                    <button className="p-2 rounded-lg hover:bg-gray-100 mr-2">
                        <FiMenu className="text-gray-600" />
                    </button>
                    <div className="relative hidden md:block">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search..."
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                        <FiSettings className="text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                        <FiMoon className="text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                        <FiMaximize className="text-gray-600" />
                    </button>

                    {/* User dropdown */}
                    <div className="relative">
                        <button className="flex items-center space-x-2">
                            <img
                                src="/assets/images/users/avatar-1.jpg"
                                alt="User"
                                className="w-8 h-8 rounded-full"
                            />
                            {/* {sidebarOpen && (
                                <span className="hidden md:block">
                                    <span className="block font-medium">Dominic Keller</span>
                                    <span className="block text-xs text-gray-500">Founder</span>
                                </span>
                            )} */}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Topbar;