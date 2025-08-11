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
import Pagination from '../../components/Pagination';
import * as XLSX from "xlsx";
import ReceiveForm from '../../components/ReceiveForm';
import CheckoutForm from '../../components/CheckoutForm';
import TransferForm from './TransferForm';
import { FiPackage, FiSend, FiTruck, FiFileText } from 'react-icons/fi';
import confirmAction from '../../components/ConfirmModal';
import Swal from 'sweetalert2';

const Assets = () => {
    const { user, selectedBranch } = useAuth();
    const { assets, categories, fetchCategories, fetchBranchAssets,
        fetchAllBranchAssets, pagination, setPagination } = useAssetMeta();
    const [showModal, setShowModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [actionType, setActionType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('');
    const [filters, setFilters] = useState({
        category: '',
    });

    const [toast, setToast] = useState(null);

    useEffect(() => {
        const params = {
            page: pagination.currentPage,
            search: searchTerm,
            type: searchType,
            asset_category_id: filters.category,
            branch_id: selectedBranch?.branch_id,
        };
        fetchBranchAssets(params);
    }, [pagination.currentPage, searchTerm, searchType, filters.category, selectedBranch]);

    useEffect(() => {

        fetchCategories();
    }, []);

    const handleView = (asset) => setSelectedAsset(asset);

    const handleExport = async (format = "xlsx") => {
        const params = {
            page: 1,
            per_page: 10000,
            search: searchTerm,
            asset_category_id: filters.category,
            branch_id: selectedBranch?.branch_id
        };

        try {
            const fullAssets = await fetchAllBranchAssets(params);

            const fullExportData = fullAssets.map(asset => ({
                Code: asset.asset_running_number || '—',
                Name: asset.name || '—',
                Type: asset.asset_type || '—',
                Category: asset.asset_category_name || '—',
                'Unit Cost': user?.add_edit_asset ? `RM ${Number(asset.asset_purchase_cost).toFixed(2)}` : '',
                Price: `RM ${Number(asset.asset_sales_cost).toFixed(2)}`,
                Branch: asset.branch_values[0]?.asset_branch_name || '—',
                Quantity: asset.branch_values[0]?.asset_current_unit || 0,
            }));

            const worksheet = XLSX.utils.json_to_sheet(fullExportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

            const file = format === "csv" ? `Assets_List.csv` : `Assets_List.xlsx`;
            XLSX.writeFile(workbook, file, { bookType: format });

        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.lastPage) {
            setPagination(prev => ({ ...prev, currentPage: page }));
        }
    };

    const handleDuplicate = async (asset) => {
        if (!asset?.id) return;

        const result = await confirmAction({
            title: 'Duplicate Asset?',
            text: `Do you want to duplicate asset "${asset.name}"?`,
            confirmButtonText: 'Yes, duplicate it!',
        });

        if (result.isConfirmed) {
            try {
                await api.post(`/api/assets/${asset.id}/copy`, null, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                // Optional: use SweetAlert toast
                Swal.fire({
                    icon: 'success',
                    title: 'Duplicated!',
                    text: 'Asset duplicated successfully!',
                    timer: 1500,
                    showConfirmButton: false,
                });

                fetchBranchAssets({ branch_id: selectedBranch?.branch_id });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error duplicating asset: ' + error.message,
                });
            }
        }
    };

    const handleSelect = (id) => {
        setSelectedAssets(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedAssets.length > 0) {
            setSelectedAssets([]);
        } else {
            setSelectedAssets(assets.map(asset => asset.id));
        }
    };

    const handleBulkAction = (type) => {
        if (!selectedAssets.length) return;

        setActionType(type);
        // Example: open a modal, or navigate to another form, or populate a pre-filled form
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

                {actionType === "receive" && (
                    <ReceiveForm
                        setShowReceiveForm={() => setActionType(null)}
                        selectedItems={selectedAssets}
                    />
                )}

                {actionType === "invoice" && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white shadow-md rounded-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto relative">
                            <button
                                onClick={() => setActionType(null)}
                                className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                aria-label="Close"
                            >
                                &times;
                            </button>
                            <CheckoutForm
                                setShowCheckoutForm={() => setActionType(null)}
                                selectedItems={selectedAssets}
                                defaultType={actionType} // e.g. 'sold' or 'request'
                            />
                        </div>
                    </div>
                )}

                {["REQUESTED", "IN-TRANSIT"].includes(actionType) && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white shadow-md rounded-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto relative">
                            <button
                                onClick={() => setActionType(null)}
                                className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                aria-label="Close"
                            >
                                &times;
                            </button>
                            <TransferForm
                                setShowTransferForm={() => setActionType(null)}
                                selectedItems={selectedAssets}
                                transferStatus={actionType} // e.g. 'sold' or 'request'
                            />
                        </div>
                    </div>
                )}

                <div className="p-6 max-w-9xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Stock List</h1>
                        {user?.add_edit_asset && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-sm bg-blue-600 text-white px-3 py-2 rounded-full hover:bg-blue-700"
                            >
                                + New Stock Registration
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

                            {/* Search Type */}
                            <div className="w-full lg:w-1/5">
                                <input
                                    type="text"
                                    placeholder="Type/Size..."
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
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

                    <div className='flex justify-between py-4'>
                        <ExportButton
                            filename="Assets_List"
                            sheetName="Assets"
                            onClick={handleExport}
                        />

                        {selectedAssets.length > 0 && (
                            <div className="flex justify-between items-center bg-gray-100 rounded">
                                <span className="text-sm text-gray-700 mr-2">
                                    {selectedAssets.length} item(s) selected
                                </span>
                                <div className="flex space-x-2">
                                    {user?.receive_transaction && (
                                        <button
                                            className="flex items-center text-sm bg-white text-blue-700 px-3 py-1 rounded hover:bg-blue-50 shadow-sm shadow-blue-600/50"
                                            onClick={() => handleBulkAction("receive")}
                                        >
                                            <FiPackage className="text-blue-500 mr-1" />
                                            Receive
                                        </button>
                                    )}
                                    {user?.add_edit_transaction && (
                                        <>
                                            <button
                                                className="flex items-center text-sm bg-white text-emerald-700 px-3 py-1 rounded hover:bg-emerald-50 shadow-sm shadow-emerald-600/50"
                                                onClick={() => handleBulkAction("REQUESTED")}
                                            >
                                                <FiSend className="text-emerald-500 mr-1" />
                                                Request
                                            </button>

                                            <button
                                                className="flex items-center text-sm bg-white text-yellow-700 px-3 py-1 rounded hover:bg-yellow-50 shadow-sm shadow-yellow-600/50"
                                                onClick={() => handleBulkAction("IN-TRANSIT")}
                                            >
                                                <FiTruck className="text-yellow-500 mr-1" />
                                                Transfer
                                            </button>
                                            <button
                                                className="flex items-center text-sm bg-white text-purple-700 px-3 py-1 rounded hover:bg-purple-50 shadow-sm shadow-purple-600/50"
                                                onClick={() => handleBulkAction("invoice")}
                                            >
                                                <FiFileText className="text-purple-500 mr-1" />
                                                Invoice
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedAssets.length === assets.length && assets.length > 0}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
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
                                            <td className="px-4 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAssets.includes(asset.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleSelect(asset.id);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
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
                                                    <div className="flex justify-between items-center ml-2">
                                                        <div>
                                                            <div
                                                                className="text-sm font-medium text-gray-900 truncate max-w-2xs break-words"
                                                                title={asset.name} // shows full name on hover
                                                            >
                                                                {asset.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{asset.asset_type}</div>
                                                        </div>
                                                        {user?.add_edit_asset && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDuplicate(asset);
                                                                }}
                                                                title="Duplicate"
                                                                className="invisible group-hover:visible text-purple-600 hover:text-purple-800 p-1 ml-4"
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
                    <Pagination
                        pagination={pagination}
                        onPageChange={handlePageChange}
                    />

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
