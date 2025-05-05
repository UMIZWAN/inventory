import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Link } from '@inertiajs/react';
import { useAuth } from '../../context/AuthContext';
import { useAssetMeta } from '../../context/AssetsContext';

const Sidebar = () => {
    const { user } = useAuth();
    const { branches, fetchAssets, loading } = useAssetMeta(); // Get branches and fetchAssets from context
    const [selectedBranch, setSelectedBranch] = useState(user?.branch_id?.toString()); // Default to user's branch
    const menu = useMemo(() => {
        if (!user) return [];

        return [
            {
                title: 'Items',
                prefix: 'items',
                items: [
                    user?.view_asset_masterlist && 'Master List',
                    'Item List',
                    'Asset Transaction',
                ].filter(Boolean),
            },
            // {
            //     title: 'Purchase',
            //     prefix: 'purchase',
            //     items: [
            //         'Order Stock',
            //         // 'Receive Stock',
            //         'View Orders',
            //         // 'View Receive History',
            //         // 'View Items On Order',
            //         // 'Order Low Stock Items',
            //         // 'Return Stock',
            //     ],
            // },
            // {
            //     title: 'Sell',
            //     prefix: 'sell',
            //     items: [
            //         'Item checkout',
            //         'View Checkout History',
            //     ],
            // },
            // {
            //     title: 'Reports',
            //     prefix: 'reports',
            //     items: [
            //         'Inventory',
            //         'Inventory by Location and Category',
            //         'Inventory with Image by Category',
            //         'Low Level Stock',
            //         'Inventory by Default Supplier',
            //         'Backorder Report',
            //         'Sales Report',
            //     ],
            // },
        ];
    }, [user]);

    const [openSections, setOpenSections] = useState({});

    useEffect(() => {
        // Load from localStorage on mount
        const savedState = localStorage.getItem('sidebarOpenSections');
        if (savedState) {
            setOpenSections(JSON.parse(savedState));
        }
    }, []);

    useEffect(() => {
        // Save to localStorage whenever openSections changes
        localStorage.setItem('sidebarOpenSections', JSON.stringify(openSections));
    }, [openSections]);

    // Handle branch change
    const handleBranchChange = (e) => {
        const branchId = e.target.value;
        console.log("Changing to branch:", branchId);
        setSelectedBranch(branchId);
        fetchAssets(branchId === "all" ? null : branchId);
    };

    const toggleSection = (title) => {
        setOpenSections((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <div className="w-64 bg-gray-200 p-2 shadow-md h-full overflow-y-auto">
            {/* Branch Selector */}
            {/* <div className="mb-4">
                <label htmlFor="branch-select" className="block text-sm font-medium text-gray-700 mb-1">
                    View Branch Assets
                </label>
                <select
                    id="branch-select"
                    value={selectedBranch || ''}
                    onChange={handleBranchChange}
                    disabled={loading}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id.toString()}>
                            {branch.name}
                        </option>
                    ))}
                </select>
            </div> */}
            <div className="mb-2 rounded">
                <ul>
                {user?.view_asset_masterlist && (
                        <Link href="/items/master-list" >
                            <li className="font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer hover:bg-sky-100">
                                <span>MasterList</span>
                            </li>
                        </Link>
                    )}
                    {user?.view_role && (
                        <Link href="/access-levels" >
                            <li className="font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer hover:bg-sky-100">
                                <span>Access Levels</span>
                            </li>
                        </Link>
                    )}
                    {user?.view_user && (
                        <Link href="/users" >
                            <li className="font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer hover:bg-sky-100">
                                <span>Users</span>
                            </li>
                        </Link>
                    )}
                    {user?.view_user && (
                        <Link href="/branch" >
                            <li className="font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer hover:bg-sky-100">
                                <span>Branches</span>
                            </li>
                        </Link>
                    )}
                    {user?.view_supplier && (
                        <Link href="/categories" >
                            <li className="font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer hover:bg-sky-100">
                                <span>Categories</span>
                            </li>
                        </Link>
                    )}
                    {/* <Link href="/tags" >
                        <li className="font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer hover:bg-sky-100">
                            <span>Tag</span>
                        </li>
                    </Link> */}
                    {user?.view_supplier && (
                        <Link href="/supplier" >
                            <li className="font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer hover:bg-sky-100">
                                <span>Suppliers</span>
                            </li>
                        </Link>
                    )}


                    {user?.view_asset && (
                        <Link href="/items/item-list" >
                            <li className="font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer hover:bg-sky-100">
                                <span>Item List</span>
                            </li>
                        </Link>
                    )}

                    {user?.view_transaction && (
                        <Link href="/items/asset-transaction" >
                            <li className="font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer hover:bg-sky-100">
                                <span>Transaction</span>
                            </li>
                        </Link>
                    )}

                </ul>
            </div>
            {/* {menu.map((section, index) => {
                const isOpen = openSections[section.title];
                return (
                    <SidebarSection
                        key={index}
                        title={section.title}
                        items={section.items}
                        prefix={section.prefix}
                        isOpen={isOpen}
                        onToggle={() => toggleSection(section.title)}
                    />
                );
            })} */}
        </div>
    );
};

const SidebarSection = ({ title, items, prefix, isOpen, onToggle }) => {
    const contentRef = useRef(null);
    const [height, setHeight] = useState('0px');

    useEffect(() => {
        if (contentRef.current) {
            if (isOpen) {
                setHeight(`${contentRef.current.scrollHeight}px`);
            } else {
                setHeight('0px');
            }
        }
    }, [isOpen]);

    return (
        <div className="mb-2 bg-gray-300 rounded">
            <div
                onClick={onToggle}
                className=" text-white font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer"
            >
                <span>{title}</span>
                {isOpen ? (
                    <FaChevronDown className="text-white" size={14} />
                ) : (
                    <FaChevronRight className="text-white" size={14} />
                )}
            </div>
            <div
                ref={contentRef}
                className="overflow-hidden transition-all duration-300 bg-white rounded-b text-sm"
                style={{ height }}
            >
                <ul>
                    {items.map((item, idx) => {
                        const slug = item.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                        const href = `/${prefix}/${slug}`;
                        return (
                            <li
                                key={idx}
                                className="px-4 py-2 hover:bg-blue-100 cursor-pointer border-b last:border-b-0"
                            >
                                <Link href={href} className="block w-full h-full">
                                    {item}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
