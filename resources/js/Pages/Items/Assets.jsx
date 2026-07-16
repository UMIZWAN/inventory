import React, { useEffect, useState } from 'react';
import AddAsset from '../../components/AddAsset';
import { FiEye, FiEdit2, FiTrash2, FiCopy } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { useAssetMeta } from '../../context/AssetsContext';
import placeholder from '../../assets/image/placeholder.png';
import ExportButton from '../../components/ExportButton';
import { useAuth } from '../../context/AuthContext';
import { Head, router } from "@inertiajs/react";
import api from '../../api/api';
import Pagination from '../../components/Pagination';
import * as XLSX from "xlsx";
import ReceiveForm from '../../components/ReceiveForm';
import CheckoutForm from '../../components/CheckoutForm';
import TransferForm from './TransferForm';
import { FiPackage, FiSend, FiTruck, FiFileText } from 'react-icons/fi';
import confirmAction from '../../components/ConfirmModal';
import Swal from 'sweetalert2';
import { LINKS } from '../../constants/links';

const ASSET_TAG_OPTIONS = ['Delivery Gift', 'Insurance Gift', 'Test Drive Gift', 'Doorgift', 'Vip Gift', 'Premium Gift', 'Event Gift', 'Booking Gift', 'Customer Visit Gift', 'Others'];

const toTitleCase = (str = '') =>
    str.toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase());

const normalizeTags = (raw) => {
    if (raw == null || raw === '') return [];
    const items = Array.isArray(raw) ? raw : [raw];
    const out = [];
    for (const item of items) {
        if (typeof item !== 'string') { if (item != null) out.push(String(item)); continue; }
        const trimmed = item.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) { parsed.forEach(p => p && out.push(String(p))); continue; }
            } catch { /* fall through */ }
        }
        out.push(item);
    }
    return [...new Set(out.filter(Boolean))];
};

const Assets = () => {
    const { user, selectedBranch } = useAuth();
    const { assets, categories, fetchCategories, fetchBranchAssets,
        fetchAllBranchAssets, pagination, setPagination } = useAssetMeta();
    const [showModal, setShowModal] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [actionType, setActionType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        tag: '',
        showInactive: false,
    });

    const [toast, setToast] = useState(null);

    // Reset pagination when branch changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, [selectedBranch]);

    useEffect(() => {
        const params = {
            page: pagination.currentPage,
            per_page: pagination.perPage,
            search: searchTerm,
            type: searchType,
            asset_category_id: filters.category,
            asset_tag: filters.tag,
            include_inactive: filters.showInactive ? 1 : 0,
            branch_id: selectedBranch?.branch_id,
        };
        fetchBranchAssets(params);
    }, [pagination.currentPage, pagination.perPage, searchTerm, searchType, filters.category, filters.tag, filters.showInactive, selectedBranch]);

    useEffect(() => {

        fetchCategories();
    }, []);

    const handleView = (asset, editMode = false) => {
        window.open(`/items/item/${asset.id}${editMode ? '?edit=1' : ''}`, '_blank');
    };

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

    const handlePerPageChange = (perPage) => {
        localStorage.setItem('assets_per_page', perPage);
        setPagination(prev => ({ ...prev, perPage, currentPage: 1 }));
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

                <div className="max-w-9xl mx-auto">
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
                                    <select
                                        value={filters.category}
                                        onChange={(e) => {
                                            setPagination(prev => ({ ...prev, current_page: 1 }));
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

                                <div>
                                    <select
                                        value={filters.tag}
                                        onChange={(e) => {
                                            setPagination(prev => ({ ...prev, current_page: 1 }));
                                            setFilters({ ...filters, tag: e.target.value });
                                        }}
                                        className="px-2 py-1 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Tags</option>
                                        {ASSET_TAG_OPTIONS.map(tag => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                </div>

                                {user?.add_edit_asset && (
                                    <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.showInactive}
                                            onChange={(e) => {
                                                setPagination(prev => ({ ...prev, current_page: 1 }));
                                                setFilters({ ...filters, showInactive: e.target.checked });
                                            }}
                                            className="rounded"
                                        />
                                        Show Deactivated
                                    </label>
                                )}
                            </div>

                            {user?.add_edit_asset && (
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="text-sm bg-blue-600 text-white px-3 py-2 rounded-full hover:bg-blue-700 lg:ml-auto whitespace-nowrap"
                                >
                                    + New Stock Registration
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-4 py-2">
                            <button
                                onClick={() => {
                                    const defaultFilters = {
                                        category: '',
                                        tag: '',
                                        showInactive: false,
                                    };
                                    setFilters(defaultFilters);
                                    setSearchTerm('');
                                    setSearchType('');
                                }}
                                className="rounded bg-gray-300 text-gray-800 px-4 py-1 hover:bg-gray-400 text-sm"
                            >
                                Clear
                            </button>
                            <ExportButton
                                filename="Assets_List"
                                sheetName="Assets"
                                onClick={handleExport}
                            />

                            {selectedAssets.length > 0 && (
                                <div className="flex items-center bg-gray-100 rounded ml-auto">
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
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-1 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedAssets.length === assets.length && assets.length > 0}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Code
                                        </th>
                                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                            <div>Name</div>
                                            <div>Type/Size</div>
                                        </th>
                                        <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div>Category</div>
                                            <div>Tag</div>
                                        </th>
                                        {user?.add_edit_asset && (
                                            <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cost
                                            </th>
                                        )}
                                        <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date Created
                                        </th>
                                        <th className="px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {assets.map((asset) => (
                                        <tr
                                            key={asset.id}
                                            className="hover:bg-gray-50 group"
                                        >
                                            <td className="px-3 py-1 text-center">
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
                                            <td className="px-1 py-2 whitespace-nowrap text-sm text-gray-500">
                                                {asset.asset_running_number || '—'}
                                            </td>
                                            <td className="px-1 py-2 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 h-10 w-10 relative">
                                                        {asset.asset_image ? (
                                                            <img
                                                                className="h-10 w-10 rounded object-cover border border-gray-100"
                                                                src={`${LINKS.API_BASE}/${asset.asset_image}`}
                                                                alt={asset.name}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.style.display = 'none';
                                                                    const fb = e.target.parentElement.querySelector('[data-fallback]');
                                                                    if (fb) fb.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div
                                                            data-fallback
                                                            className="h-10 w-10 rounded border border-gray-200 bg-gray-50 text-gray-400 items-center justify-center"
                                                            style={{ display: asset.asset_image ? 'none' : 'flex' }}
                                                        >
                                                            <FiPackage className="w-5 h-5" strokeWidth={1.5} />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center gap-3 flex-1 min-w-0">
                                                        <div className="min-w-0">
                                                            <div
                                                                className={`text-sm font-semibold capitalize leading-snug break-words ${asset.is_active === false ? 'text-gray-400 line-through' : 'text-gray-900'}`}
                                                                title={asset.name}
                                                            >
                                                                {toTitleCase(asset.name)}
                                                                {asset.is_active === false && (
                                                                    <span className="ml-2 no-underline px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-red-100 text-red-800 align-middle inline-block">
                                                                        Deactivated
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {asset.asset_type && (
                                                                <div className="text-xs text-gray-500 mt-0.5">{asset.asset_type}</div>
                                                            )}
                                                        </div>
                                                        {user?.add_edit_asset && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDuplicate(asset);
                                                                }}
                                                                title="Duplicate"
                                                                className="invisible group-hover:visible text-purple-600 hover:text-purple-800 p-1 flex-shrink-0"
                                                            >
                                                                <FiCopy className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-1 py-2 text-sm text-gray-500 break-words align-middle">
                                                <div>{asset.asset_category_name || ' '}</div>
                                                <div className="text-xs text-gray-400 mt-0.5 space-y-0.5">
                                                    {normalizeTags(asset.asset_tag).map(tag => (
                                                        <div key={tag}>{tag}</div>
                                                    ))}
                                                </div>
                                            </td>
                                            {user?.add_edit_asset && (
                                                <td className="px-1 py-2 whitespace-nowrap text-sm text-gray-500">
                                                    RM {Number(asset.asset_purchase_cost).toFixed(2) || '0.00'}
                                                </td>
                                            )}
                                            <td className="px-1 py-2 whitespace-nowrap text-sm text-gray-500">
                                                RM {Number(asset.asset_sales_cost).toFixed(2) || '0.00'}
                                            </td>
                                            <td className="px-1 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {new Date(asset.created_at).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-1 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {asset.branch_values[0]?.asset_branch_name || '—'}: {asset.branch_values[0]?.asset_current_unit || '0'}
                                            </td>
                                            <td className="px-1 py-2 whitespace-nowrap text-center">
                                                <div className="inline-flex flex-col items-center gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleView(asset);
                                                        }}
                                                        className="inline-flex items-center justify-center gap-1 w-16 bg-white shadow-sm shadow-blue-600/30 px-3 py-0.5 rounded-full text-[11px] text-blue-600 hover:text-blue-800"
                                                    >
                                                        <FiEye className="w-3 h-3" />
                                                        View
                                                    </button>
                                                    {user?.add_edit_asset && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleView(asset, true);
                                                            }}
                                                            className="inline-flex items-center justify-center gap-1 w-16 bg-white shadow-sm shadow-amber-600/30 px-3 py-0.5 rounded-full text-[11px] text-amber-600 hover:text-amber-800"
                                                        >
                                                            <FiEdit2 className="w-3 h-3" />
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>
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
                        onPerPageChange={handlePerPageChange}
                    />

                    {showModal && (
                        <AddAsset setShowModal={setShowModal} />
                    )}

                </div>
            </Layout>
        </>
    );
};

export default Assets;
