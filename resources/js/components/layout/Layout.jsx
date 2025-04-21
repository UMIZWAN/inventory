import React from 'react';
import Sidebar from './Sidebar';
// import Topbar from './Topbar';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col h-screen">
            {/* Topbar */}
            {/* <Topbar/> */}
            <header className="bg-white-600 px-6 py-4 shadow-md">
                <h1 className="text-lg font-bold">Inventory System</h1>
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
