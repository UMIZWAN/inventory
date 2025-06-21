import React, { useState, useEffect } from "react";
import api from "../../api/api";
import Layout from '../../components/layout/Layout';
import { Head } from "@inertiajs/react";
import ExportButton from "../../components/ExportButton";
import { useAuth } from "../../context/AuthContext";
import placeholder from '../../assets/image/placeholder.png'; // Import a placeholder image
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const MasterListPage = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);
    const [editRowId, setEditRowId] = useState(null);
    const [editedValue, setEditedValue] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

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

    useEffect(() => {
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
        // Reset to first page when search changes
        setCurrentPage(1);
    }, [searchTerm, items]);

    const handleEdit = (id, currentValue) => {
        setEditRowId(id);
        setEditedValue(currentValue);
    };

    const handleSaveEdit = async (id) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, asset_running_number: editedValue } : item
            )
        );

        await api.put(`/api/assets/${id}`, { asset_running_number: editedValue });

        setEditRowId(null);
        setEditedValue("");
    };

    const handleCancelEdit = () => {
        setEditRowId(null);
        setEditedValue("");
    };

    const getStatusBadge = (totalUnits, stableUnit) => {
        if (!totalUnits || !stableUnit) {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Critical Stock
                </span>
            );
        }
        const percentage = (totalUnits / stableUnit) * 100;
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
        } else {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Critical Stock
                </span>
            );
        }
    };

    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate total pages
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    // Function to determine which page numbers to show
    const getPageRange = () => {
        const delta = 2; // Number of pages to show before and after current page
        const range = [];
        const rangeWithDots = [];
        let l;

        // Always include page 1
        range.push(1);

        // Calculate the range of pages to show around current page
        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
            if (i > 1 && i < totalPages) {
                range.push(i);
            }
        }

        // Always include the last page if there are more than 1 pages
        if (totalPages > 1) {
            range.push(totalPages);
        }

        // Add dots where needed
        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    const exportData = filteredItems.map((item) => ({
        "Asset Number": item.asset_running_number || "",
        "Item Name": item.name || "",
        "Category": item.asset_category_name || "",
        "Total Quantity": item.total_units || 0,
        "Status": (() => {
            const total = item.total_units;
            const stable = item.asset_stable_unit;
            if (!total || !stable) return "Critical Stock";
            const pct = (total / stable) * 100;
            if (pct >= 100) return "In Stock";
            else if (pct >= 50) return "Low Stock";
            else return "Critical Stock";
        })(),
        "Branch Distribution": item.branch_values
            ? item.branch_values
                .map(
                    (branch) =>
                        `${branch.asset_branch_name}: ${branch.asset_current_unit} ${item.asset_unit_measure}`
                )
                .join(" \n ")
            : "",
    }));

    return (
        <Layout>
            <Head title="Master List" />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Master Inventory List</h1>
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, code or category..."
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
                    <div className="mt-4">
                        <ExportButton
                            data={exportData}
                            filename="master_inventory_list"
                            sheetName="Inventory"
                        />
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto bg-white rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Image
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Quantity
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Branch Distribution
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap relative group">
                                                    {editRowId === item.id ? (
                                                        <input
                                                            type="text"
                                                            className="text-sm text-gray-900 border border-gray-300 rounded-md px-2 py-1 w-full"
                                                            value={editedValue}
                                                            onChange={(e) => setEditedValue(e.target.value)}
                                                            onBlur={() => handleSaveEdit(item.id)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    e.target.blur(); // Triggers onBlur for saving + defocus
                                                                }
                                                                if (e.key === "Escape") {
                                                                    handleCancelEdit();
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <div className="text-sm text-gray-500 flex items-center justify-between">
                                                            <span>{item.asset_running_number}</span>
                                                            {user?.add_edit_asset && (
                                                                <button
                                                                    onClick={() => handleEdit(item.id, item.asset_running_number)}
                                                                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600"
                                                                    title="Edit"
                                                                >
                                                                    ✎
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <Zoom>
                                                            <img className="h-10 w-10 rounded"
                                                                src={item.asset_image ? `http://127.0.0.1:8000/${item.asset_image}` : placeholder}
                                                                alt={item.name}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = placeholder;
                                                                }}
                                                            />
                                                        </Zoom>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        <span className="whitespace-pre-line">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {item.asset_category_name || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-sm text-gray-500">
                                                        {item.total_units || 0}
                                                        {/* {item.asset_stable_unit || 0} {item.asset_unit_measure} */}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
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

                        {/* Pagination */}
                        {filteredItems.length > 0 && (
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                                    <span className="font-medium">
                                        {indexOfLastItem > filteredItems.length ? filteredItems.length : indexOfLastItem}
                                    </span>{" "}
                                    of <span className="font-medium">{filteredItems.length}</span> results
                                </div>
                                <nav className="flex items-center">
                                    <button
                                        onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                                        disabled={currentPage === 1}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === 1
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        Previous
                                    </button>
                                    <div className="hidden md:flex">
                                        {getPageRange().map((number, index) => (
                                            number === '...' ? (
                                                <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                                                    {number}
                                                </span>
                                            ) : (
                                                <button
                                                    key={`page-${number}`}
                                                    onClick={() => paginate(number)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${currentPage === number
                                                        ? "bg-blue-600 text-white"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {number}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === totalPages || totalPages === 0
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default MasterListPage;
