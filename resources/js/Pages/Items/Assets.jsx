import React, { useEffect, useState } from 'react';
import AddAsset from '../../components/AddAsset';
import ItemDetails from '../../components/ItemDetails';
import { FiEye, FiEdit2, FiTrash2, FiCopy } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { useAssetMeta } from '../../context/AssetsContext';
import placeholder from '../../assets/image/placeholder.png';
import { useAuth } from '../../context/AuthContext';
import { Head } from "@inertiajs/react";
import api from '../../api/api';

const Assets = () => {
    const { user } = useAuth();
    const { assets, fetchCategories, fetchBranchAssets, loading } = useAssetMeta();
    const [showModal, setShowModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        tag: '',
        location: '',
        status: '',
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchBranchAssets();
        fetchCategories();
    }, []);

    const handleView = (asset) => setSelectedAsset(asset);

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.asset_running_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.asset_type?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = filters.category ? asset.asset_category_name === filters.category : true;

        const current = Number(asset.asset_current_value);
        const stable = Number(asset.asset_stable_value);
        let computedStatus = 'Normal';
        if (current <= 0) computedStatus = 'Critical';
        else if (current <= stable / 3) computedStatus = 'Very Low';
        else if (current <= (2 * stable) / 3) computedStatus = 'Low';

        const matchesStatus = filters.status ? computedStatus === filters.status : true;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate total pages
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

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

    const handleDuplicate = async (asset) => {
        if (!asset?.id) return;

        try {
            await api.post(`/api/assets/${asset.id}/copy`, null, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setToast('Asset duplicated successfully!');
            setTimeout(() => {
                setToast(null);
            }, 2000);

            fetchBranchAssets();
        } catch (error) {
            alert('Error duplicating asset: ' + error.message);
        }
    };

    return (
        <>
            <Layout>
                <Head title="Item List" />
                {toast && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm px-4 py-2 rounded shadow">
                        {toast}
                    </div>
                )}
                <div className="p-6 max-w-9xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Assets List</h1>
                        {user?.add_edit_asset && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                            >
                                + Add Item
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                        {/* Search Input */}
                        <div className="w-full lg:w-1/3">
                            <input
                                type="text"
                                placeholder="Search by name/code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <label className="block mb-1">Categories:</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Categories</option>
                                    {[...new Set(assets.map(a => a.asset_category_name).filter(Boolean))].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        {user?.add_edit_asset && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                unit Cost
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Branch
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date Created
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.map((asset) => (
                                        <tr
                                            key={asset.id}
                                            className="hover:bg-gray-50 group cursor-pointer"
                                            onClick={() => handleView(asset)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {asset.asset_running_number || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded"
                                                            src={asset.asset_image ? `http://127.0.0.1:8000/${asset.asset_image}` : placeholder}
                                                            // src={asset.asset_image || placeholder}
                                                            alt={asset.name}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = placeholder;
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center w-full ml-2">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                                                            <div className="text-xs text-gray-500">{asset.asset_type}</div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDuplicate(asset);
                                                            }}
                                                            title="Duplicate"
                                                            className="invisible group-hover:visible text-purple-600 hover:text-purple-800 p-1"
                                                        >
                                                            <FiCopy className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {asset.asset_category_name || '—'}
                                            </td>
                                            {user?.add_edit_asset && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    RM {Number(asset.asset_purchase_cost).toFixed(2) || '—'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                RM {Number(asset.asset_sales_cost).toFixed(2) || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {asset.branch_values[0]?.asset_branch_name || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {asset.branch_values[0]?.asset_current_unit || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {new Date(asset.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {filteredAssets.length > 0 && (
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                                <span className="font-medium">
                                    {indexOfLastItem > filteredAssets.length ? filteredAssets.length : indexOfLastItem}
                                </span>{" "}
                                of <span className="font-medium">{filteredAssets.length}</span> results
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

                    {showModal && (
                        <AddAsset setShowModal={setShowModal} />
                    )}

                    {selectedAsset && (
                        <ItemDetails
                            asset={selectedAsset}
                            onClose={() => {
                                setSelectedAsset(null);
                            }}
                        />
                    )}
                </div>
            </Layout>
        </>
    );
};

export default Assets;
