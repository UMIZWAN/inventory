import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaChevronDown, FaChevronRight, FaFileInvoice } from 'react-icons/fa';
import { FiShield, FiUsers, FiMapPin, FiTag, FiPackage, FiTruck, FiList, FiRepeat } from 'react-icons/fi';
import { TbBuildingCommunity, TbReportMoney } from "react-icons/tb";
import { Link } from '@inertiajs/react';
import { useAuth } from '../../context/AuthContext';
import { useAssetMeta } from '../../context/AssetsContext';
import moment from "moment";

const Sidebar = () => {
    const { user, fetchUser, setLoading } = useAuth();
    const { assets, assetTransfer } = useAssetMeta(); 

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
          fetchUser();
        } else {
          setLoading(false);
        }
      }, []);

    const hasLowOrCriticalStock = assets?.some((item) => {
        const total = item.total_units || 0;
        const stable = item.asset_stable_unit || 0;
        const percentage = (total / stable) * 100;
        return percentage < 100; // could use < 50 if you only want critical
    });

    const now = moment();

    const incomingTransfers = assetTransfer?.filter(
        (txn) =>
            txn.assets_transaction_status === "IN-TRANSIT" &&
            txn.assets_to_branch_id === user?.branch_id
    ) || [];

    const hasIncomingTransfer = incomingTransfers.length > 0;

    const hasOverdueTransfer = incomingTransfers.some((txn) => {
        const created = moment(txn.created_at);
        return now.diff(created, "days") > 5;
    });

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

    const toggleSection = (title) => {
        setOpenSections((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <div className="w-64 bg-white p-2 shadow-md h-full overflow-y-auto">
            <div className="mb-2 rounded px-2">
                <div className="border-b border-gray-300 my-2 py-2">
                    <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide px-3">Administration</label>
                </div>
                <ul className="space-y-1">

                    {user?.view_role && (
                        <Link href="/access-levels">
                            <li className="flex items-center gap-2 px-3 py-2 rounded hover:bg-sky-100 cursor-pointer">
                                <FiShield className="text-sky-600" />
                                <span className="font-medium">Access Levels</span>
                            </li>
                        </Link>
                    )}

                    {user?.view_user && (
                        <Link href="/users">
                            <li className="flex items-center gap-2 px-3 py-2 rounded hover:bg-sky-100 cursor-pointer">
                                <FiUsers className="text-sky-600" />
                                <span className="font-medium">Users</span>
                            </li>
                        </Link>
                    )}

                    {user?.view_branch && (
                        <Link href="/branch">
                            <li className="flex items-center gap-2 px-3 py-2 rounded hover:bg-sky-100 cursor-pointer">
                                <FiMapPin className="text-sky-600" />
                                <span className="font-medium">Branches</span>
                            </li>
                        </Link>
                    )}

                    {user?.settings && (
                        <Link href="/categories">
                            <li className="flex items-center gap-2 px-3 py-2 rounded hover:bg-sky-100 cursor-pointer">
                                <FiTag className="text-sky-600" />
                                <span className="font-medium">Categories</span>
                            </li>
                        </Link>
                    )}

                    {user?.settings && (
                        <Link href="/supplier">
                            <li className="flex items-center gap-2 px-3 py-2 rounded hover:bg-sky-100 cursor-pointer">
                                <TbBuildingCommunity className="text-sky-600" />
                                <span className="font-medium">Suppliers</span>
                            </li>
                        </Link>
                    )}

                    {user?.settings && (
                        <Link href="/shipping">
                            <li className="flex items-center gap-2 px-3 py-2 rounded hover:bg-sky-100 cursor-pointer">
                                <FiTruck className="text-sky-600" />
                                <span className="font-medium">Shipping Option</span>
                            </li>
                        </Link>
                    )}

                    {user?.settings && (
                        <Link href="/purpose">
                            <li className="flex items-center gap-2 px-3 py-2 rounded hover:bg-sky-100 cursor-pointer">
                                <FaFileInvoice className="text-sky-600" />
                                <span className="font-medium">Invoice Purpose </span>
                            </li>
                        </Link>
                    )}
                </ul>
                <div className="border-b border-gray-300 my-2 py-2">
                    <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide px-3 mt-3">Manage Assets</label>
                </div>
                <ul className="space-y-1">
                    {user?.view_asset_masterlist && (
                        <Link href="/items/master-list">
                            <li className="flex items-center gap-2 px-3 py-2 rounded hover:bg-sky-100 cursor-pointer relative">
                                <FiList className="text-sky-600" />
                                <span className="font-medium">MasterList</span>
                                {hasLowOrCriticalStock && (
                                    <span className="absolute right-3 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </li>
                        </Link>
                    )}

                    {user?.view_asset && (
                        <Link href="/items/item-list">
                            <li className="flex items-center gap-2 px-3 py-2 rounded hover:bg-sky-100 cursor-pointer">
                                <FiPackage className="text-sky-600" />
                                <span className="font-medium">Item List</span>
                            </li>
                        </Link>
                    )}

                    {user?.view_transaction && (
                        <Link href="/items/asset-transaction">
                        <li className="relative flex items-center gap-2 px-3 py-2 rounded hover:bg-sky-100 cursor-pointer">
                          <FiRepeat className="text-sky-600" />
                          <span className="font-medium">Transaction</span>
                          {hasIncomingTransfer && (
                            <span
                              className={`absolute right-3 w-2 h-2 rounded-full ${
                                hasOverdueTransfer ? "bg-red-500" : "bg-green-500"
                              }`}
                            />
                          )}
                        </li>
                      </Link>
                    )}
                </ul>
                <div className="border-b border-gray-300 my-2 py-2">
                    <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide px-3 mt-3">Manage Report</label>
                </div>
                <ul className="space-y-1">
                    {user?.view_reports && (
                        <Link href="/inv-list">
                        <li className="relative flex items-center gap-2 px-3 py-2 rounded hover:bg-sky-100 cursor-pointer">
                          <TbReportMoney className="text-sky-600" />
                          <span className="font-medium">Invoice</span>
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
