import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaChevronDown, FaChevronRight, FaFileInvoice } from "react-icons/fa";
import {
    FiShield,
    FiUsers,
    FiMapPin,
    FiTag,
    FiPackage,
    FiTruck,
    FiList,
    FiRepeat,
} from "react-icons/fi";
import {
    TbBuildingCommunity,
    TbReportMoney,
    TbReportAnalytics,
} from "react-icons/tb";
import { Link, usePage } from "@inertiajs/react";
import { useAuth } from "../../context/AuthContext";
import { useAssetMeta } from "../../context/AssetsContext";
import moment from "moment";

const NavItem = ({ href, icon: Icon, label, badge = null }) => {
    const { url } = usePage();
    const isActive = url === href || url.startsWith(href + "?") || url.startsWith(href + "/");

    return (
        <Link
            href={href}
            className={`relative flex items-center gap-2.5 px-2 py-[7px] rounded-lg text-sm transition-colors ${
                isActive
                    ? "bg-indigo-50 text-indigo-800"
                    : "text-gray-800 hover:bg-gray-100"
            }`}
        >
            <Icon
                className={`flex-shrink-0 w-4 h-4 ${isActive ? "text-indigo-800" : "text-gray-500"}`}
                strokeWidth={1.5}
            />
            <span>{label}</span>
            {badge && (
                <span className={`absolute right-2 w-2 h-2 rounded-full ${badge}`} />
            )}
        </Link>
    );
};

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

    const incomingTransfers =
        assetTransfer?.filter(
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
                title: "Items",
                prefix: "items",
                items: [
                    user?.view_asset_masterlist && "Master List",
                    "Item List",
                    "Asset Transaction",
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
        const savedState = localStorage.getItem("sidebarOpenSections");
        if (savedState) {
            setOpenSections(JSON.parse(savedState));
        }
    }, []);

    useEffect(() => {
        // Save to localStorage whenever openSections changes
        localStorage.setItem(
            "sidebarOpenSections",
            JSON.stringify(openSections)
        );
    }, [openSections]);

    const toggleSection = (title) => {
        setOpenSections((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <div className="w-full min-h-full bg-white flex flex-col gap-4">
            <div>
                <div className="text-[11px] uppercase tracking-[0.08em] text-gray-400 mb-1 px-2">
                    Administration
                </div>
                <nav className="flex flex-col gap-[1px]">
                    {user?.view_role && (
                        <NavItem href="/access-levels" icon={FiShield} label="Access Levels" />
                    )}
                    {user?.view_user && (
                        <NavItem href="/users" icon={FiUsers} label="Users" />
                    )}
                    {user?.view_branch && (
                        <NavItem href="/branch" icon={FiMapPin} label="Branches" />
                    )}
                    {user?.settings && (
                        <NavItem href="/categories" icon={FiTag} label="Categories" />
                    )}
                    {user?.settings && (
                        <NavItem href="/supplier" icon={TbBuildingCommunity} label="Suppliers" />
                    )}
                    {user?.settings && (
                        <NavItem href="/shipping" icon={FiTruck} label="Shipping Option" />
                    )}
                    {user?.settings && (
                        <NavItem href="/purpose" icon={FaFileInvoice} label="Invoice Purpose" />
                    )}
                    {(user?.email === "dayangnh95@gmail.com" ||
                        user?.email === "umwongsw@gmail.com" ||
                        user?.email === "nafiqahcyindy@gmail.com") && (
                        <NavItem href="/import" icon={FiShield} label="Import CSV" />
                    )}
                </nav>
            </div>

            <div>
                <div className="text-[11px] uppercase tracking-[0.08em] text-gray-400 mb-1 px-2">
                    Manage Assets
                </div>
                <nav className="flex flex-col gap-[1px]">
                    {user?.view_asset_masterlist && (
                        <NavItem
                            href="/items/master-list"
                            icon={FiList}
                            label="Master List"
                            badge={hasLowOrCriticalStock ? "bg-red-500" : null}
                        />
                    )}
                    {user?.view_asset && (
                        <NavItem href="/items/item-list" icon={FiPackage} label="Stock List" />
                    )}
                    {user?.view_transaction && (
                        <NavItem
                            href="/items/asset-transaction"
                            icon={FiRepeat}
                            label="Stock Movement"
                            badge={hasIncomingTransfer ? (hasOverdueTransfer ? "bg-red-500" : "bg-green-500") : null}
                        />
                    )}
                </nav>
            </div>

            <div>
                <div className="text-[11px] uppercase tracking-[0.08em] text-gray-400 mb-1 px-2">
                    Manage Report
                </div>
                <nav className="flex flex-col gap-[1px]">
                    {user?.view_reports && (
                        <NavItem href="/inventory" icon={TbReportAnalytics} label="IN-OUT History" />
                    )}
                    {user?.view_reports && (
                        <NavItem href="/inv-list" icon={TbReportMoney} label="Invoice" />
                    )}
                </nav>
            </div>
        </div>
    );
};

const SidebarSection = ({ title, items, prefix, isOpen, onToggle }) => {
    const contentRef = useRef(null);
    const [height, setHeight] = useState("0px");

    useEffect(() => {
        if (contentRef.current) {
            if (isOpen) {
                setHeight(`${contentRef.current.scrollHeight}px`);
            } else {
                setHeight("0px");
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
                        const slug = item
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^\w-]/g, "");
                        const href = `/${prefix}/${slug}`;
                        return (
                            <li
                                key={idx}
                                className="px-4 py-2 hover:bg-blue-100 cursor-pointer border-b last:border-b-0"
                            >
                                <Link
                                    href={href}
                                    className="block w-full h-full"
                                >
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
