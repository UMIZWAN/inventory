import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Link } from '@inertiajs/react';

const Sidebar = () => {
    const menu = [
        {
            title: 'Items',
            prefix: 'items',
            items: [
                'Item List',
                // 'View Transfers',
                'Transfer Stock',
                'Import Items from CSV',
            ],
        },
        {
            title: 'Purchase',
            prefix: 'purchase',
            items: [
                'Order Stock',
                'Receive Stock',
                'View Orders',
                'View Receive History',
                // 'View Items On Order',
                'Order Low Stock Items',
                // 'Return Stock',
            ],
        },
        {
            title: 'Sell',
            prefix: 'sell',
            items: [
                'Sell Stock',
                'View Sales History',
            ],
        },
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
        <div className="w-64 bg-gray-200 p-2 shadow-md h-full overflow-y-auto">
            <div className="mb-2 rounded">
                <ul>
                    <Link href="/categories" >
                        <li className="font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer hover:bg-sky-100">
                            <span>Categories</span>
                        </li>
                    </Link>
                    <Link href="/tags" >
                        <li className="font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer hover:bg-sky-100">
                            <span>Tag</span>
                        </li>
                    </Link>
                    <Link href="/supplier" >
                        <li className="font-semibold px-3 py-2 rounded-t flex items-center justify-between cursor-pointer hover:bg-sky-100">
                            <span>Suppliers</span>
                        </li>
                    </Link>
                </ul>
            </div>
            {menu.map((section, index) => {
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
            })}
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
