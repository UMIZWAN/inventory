import React, { useEffect, useState } from 'react';
import AddAsset from '../../components/AddAsset';
import ItemDetails from '../../components/ItemDetails';
import { FiEye, FiEdit2, FiTrash2, FiCopy } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { useAssetMeta } from '../../context/AssetsContext';
import placeholder from '../../assets/image/placeholder.png';
import ExportButton from '../../components/ExportButton';
import { useAuth } from '../../context/AuthContext';
import { Head } from "@inertiajs/react";
import api from '../../api/api';

const Assets = () => {
    const { user } = useAuth();
    const { assets, categories, fetchCategories, fetchBranchAssets, pagination, setPagination } = useAssetMeta();
    const [showModal, setShowModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: '',
    });

    const [toast, setToast] = useState(null);

    useEffect(() => {
        const params = {
            page: pagination.current_page,
            search: searchTerm,
            asset_category_id: filters.category,
        };
        fetchBranchAssets(params);
    }, [pagination.current_page, searchTerm, filters.category]);

    useEffect(() => {

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

    const exportData = filteredAssets.map(asset => ({
        Code: asset.asset_running_number || '—',
        Name: asset.name || '—',
        Type: asset.asset_type || '—',
        Category: asset.asset_category_name || '—',
        'Unit Cost': user?.add_edit_asset ? `RM ${Number(asset.asset_purchase_cost).toFixed(2)}` : '',
        Price: `RM ${Number(asset.asset_sales_cost).toFixed(2)}`,
        Branch: asset.branch_values[0]?.asset_branch_name || '—',
        Quantity: asset.branch_values[0]?.asset_current_unit || 0,
    }));

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.lastPage) {
            fetchBranchAssets(page);
        }
    };

    // const paginate = (pageNumber) => {
    //     setPagination(prev => ({ ...prev, current_page: pageNumber }));
    // };

    const getPageRange = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        range.push(1);

        for (let i = pagination.currentPage - delta; i <= pagination.currentPage + delta; i++) {
            if (i > 1 && i < pagination.lastPage) {
                range.push(i);
            }
        }

        if (pagination.lastPage > 1) {
            range.push(pagination.lastPage);
        }

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

                    <div>
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-4">
                            {/* Search Input */}
                            <div className="w-full lg:w-1/4">
                                <input
                                    type="text"
                                    placeholder="Search by name/code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-1 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    {/* <label className="block mb-1 text-xs font-bold">Categories:</label> */}
                                    <select
                                        value={filters.category}
                                        onChange={(e) => {
                                            setPagination(prev => ({ ...prev, current_page: 1 })); // Reset to first page
                                            setFilters({ ...filters, category: e.target.value });
                                        }}
                                        className="px-2 py-1 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>

                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            {/* <button
                                onClick={() => fetchBranchAssets(filters)}
                                className="rounded bg-blue-600 text-white px-4 py-1 hover:bg-blue-700 text-sm"
                            >
                                Apply
                            </button> */}
                            <button
                                onClick={() => {
                                    const defaultFilters = {
                                        category: ''
                                    };
                                    setFilters(defaultFilters);
                                    setSearchTerm('');
                                }}
                                className="rounded bg-gray-300 text-gray-800 px-4 py-1 hover:bg-gray-400 text-sm"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className='flex justify-end mb-4'>
                        <ExportButton data={exportData} filename="Assets_List" sheetName="Assets" />
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
                                    {assets.map((asset) => (
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
                                                        {user?.add_edit_asset && (
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
                                                        )}
                                                    </div>

                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {asset.asset_category_name || '—'}
                                            </td>
                                            {user?.add_edit_asset && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    RM {Number(asset.asset_purchase_cost).toFixed(2) || '0.00'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                RM {Number(asset.asset_sales_cost).toFixed(2) || '0.00'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {asset.branch_values[0]?.asset_branch_name || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {asset.branch_values[0]?.asset_current_unit || '0'}
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
                    {pagination.total > 0 && (
    <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
            Showing <span className="font-medium">
                {(pagination.currentPage - 1) * pagination.perPage + 1}
            </span> to <span className="font-medium">
                {Math.min(pagination.currentPage * pagination.perPage, pagination.total)}
            </span> of <span className="font-medium">{pagination.total}</span> results
        </div>
        <nav className="flex items-center">
            <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    pagination.currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
                Previous
            </button>
            <div className="hidden md:flex">
                {getPageRange().map((number, index) => (
                    number === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-4 py-2 text-sm text-gray-700">...</span>
                    ) : (
                        <button
                            key={`page-${number}`}
                            onClick={() => handlePageChange(number)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                pagination.currentPage === number
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
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    pagination.currentPage === pagination.lastPage ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50"
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
