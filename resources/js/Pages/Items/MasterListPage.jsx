import React, { useState, useEffect } from "react";
import api from "../../api/api";
import Layout from '../../components/layout/Layout';
import { Head } from "@inertiajs/react";

const MasterListPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const response = await api.get("/api/assets");
                if (response.data.success && response.data.data) {
                    setItems(response.data.data);
                    setFilteredItems(response.data.data);
                } else {
                    console.error("No assets found or invalid response format");
                }
            } catch (error) {
                console.error("Error fetching assets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredItems(items);
        } else {
            const filtered = items.filter(
                (item) =>
                    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.asset_running_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.asset_category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.asset_tag_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredItems(filtered);
        }
    }, [searchTerm, items]);

    const getStatusBadge = (totalUnits, stableUnit) => {
        if (!totalUnits || !stableUnit) {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Critical Stock
                </span>
            );
        }
        
        const percentage = 0;
        percentage = (totalUnits / stableUnit) * 100;

        if (percentage >= 100) {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    In Stock
                </span>
            );
        } else if (percentage >= 50) {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Low Stock
                </span>
            );
        } else  {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Critical Stock
                </span>
            );
        }
    };

    return (
        <Layout>
            <Head title="Master List" />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Master Inventory List</h1>

                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, asset number, category or tag..."
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Asset Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Item Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Quantity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Branch Distribution
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.asset_running_number}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {item.asset_category_name || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {item.total_units || 0} / {item.asset_stable_unit || 0} {item.asset_unit_measure}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(item.total_units, item.asset_stable_unit)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500">
                                                    {item.branch_values && item.branch_values.map((branch, idx) => (
                                                        <div key={idx} className="mb-1">
                                                            {branch.asset_branch_name}: {branch.asset_current_unit} {item.asset_unit_measure}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-6 py-4 text-center text-sm text-gray-500"
                                        >
                                            No assets found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MasterListPage;
