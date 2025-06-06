import React, { useState, useEffect } from 'react';
import { useAssetMeta } from '../../context/AssetsContext';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import ExportButton from '../../components/ExportButton';
import TransactionModalWrapper from '../../components/TransactionModalWrapper';
import Pagination from '../../components/Pagination';

function InventoryReport() {
    const { user } = useAuth();
    const {
        categories, fetchCategories,
        branches, fetchBranches, } = useAssetMeta();
    const [filters, setFilters] = useState({
        branch: user?.branch_id || '',
        search: '',
        category: '',
        from: '',
        to: '',
    });
    const [report, setReport] = useState([]);
    const [txnId, setTxnId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 10,
        total: 0,
        lastPage: 1
    });

    useEffect(() => {
        // setFilters((prev) => ({ ...prev, branch: user?.branch_id || '' }));
        // fetchReport({ branch: user?.branch_id });
        fetchCategories();
        fetchBranches();
    }, []);

    const fetchReport = async (filters = {}, page = 1) => {
        try {
            const params = new URLSearchParams();

            if (filters.branch) params.append('asset_branch_id', filters.branch);
            if (filters.search) params.append('search', filters.search);
            if (filters.category) params.append('category', filters.category);
            if (filters.from) params.append('from', filters.from);
            if (filters.to) params.append('to', filters.to);
            params.append('page', page);

            const response = await api.get(`/api/report?${params.toString()}`);
            setReport(response.data.data);
            setPagination({
                currentPage: response.data.meta.current_page,
                perPage: response.data.meta.per_page,
                total: response.data.meta.total,
                lastPage: response.data.meta.last_page,
            });
        } catch (error) {
            console.error("Failed to fetch report:", error);
        }
    };

    const exportData = [];
    const merges = [];

    let rowIndex = 1; // header row is index 0

    report?.forEach((item) => {
        const branch = item.branch_values[0];
        const assetIns = branch?.asset_in || [];
        const assetOuts = branch?.asset_out || [];
        const maxRows = Math.max(assetIns.length, assetOuts.length, 1);

        for (let i = 0; i < maxRows; i++) {
            const assetIn = assetIns[i] || {};
            const assetOut = assetOuts[i] || {};

            exportData.push({
                Code: i === 0 ? item.asset_running_number : '',
                Name: i === 0 ? item.name : '',
                "Stock In Date": assetIn.created_at ? new Date(assetIn.created_at).toLocaleDateString() : '',
                "Stock In Type": assetIn.asset_transaction_type || '',
                "Stock In From": assetIn.supplier_name || assetIn.assets_from_branch_name || '',
                "Stock In Qty": assetIn.asset_unit || '',
                "Stock Out Date": assetOut.created_at ? new Date(assetOut.created_at).toLocaleDateString() : '',
                "Stock Out Type": assetOut.asset_transaction_type || '',
                "Stock Out Purpose": assetOut.asset_transaction_purpose_name || '',
                "Stock Out Qty": assetOut.asset_unit || '',
                "Current Unit": i === 0 ? branch?.asset_current_unit || '' : ''
            });
        }

        if (maxRows > 1) {
            // Merge "Code" (A), "Name" (B), and "Current Unit" (K)
            merges.push(
                { s: { r: rowIndex, c: 0 }, e: { r: rowIndex + maxRows - 1, c: 0 } }, // Column A
                { s: { r: rowIndex, c: 1 }, e: { r: rowIndex + maxRows - 1, c: 1 } }, // Column B
                { s: { r: rowIndex, c: 10 }, e: { r: rowIndex + maxRows - 1, c: 10 } } // Column K
            );
        }

        rowIndex += maxRows;
    });

    const handleOpenTransaction = (id) => {
        setTxnId(id);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setTxnId(null); // optional: clear ID
    };

    return (
        <Layout>
            <div className="overflow-x-auto bg-white shadow rounded-lg p-4 space-y-4 mt-4">
                <h1 className="text-2xl font-bold mb-4">Inventory Report</h1>

                <div className="bg-white p-4 rounded-md shadow space-y-2">
                    <h3 className="font-semibold text-lg">Filter</h3>
                    <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                            <label className="block mb-1">Branch</label>
                            <select
                                className="text-sm border px-2 py-1 rounded w-full"
                                value={filters.branch}
                                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                            >
                                <option value="">Branches</option>
                                {branches?.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1">Code/Name</label>
                            <input
                                type="text"
                                placeholder="Search by code or name"
                                className="border px-3 py-1 rounded w-full"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Category</label>
                            <select
                                className="border px-3 py-1 rounded w-full"
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <option value="">All Categories</option>
                                {categories?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-2">
                        <div>
                            <label className="block mb-1">Date From</label>
                            <input
                                type="date"
                                className="border px-3 py-1 rounded w-full"
                                value={filters.from}
                                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Date To</label>
                            <input
                                type="date"
                                className="border px-3 py-1 rounded w-full"
                                value={filters.to}
                                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => fetchReport(filters)}
                            className="rounded bg-blue-600 text-white px-4 py-1 hover:bg-blue-700 text-sm"
                        >
                            Apply
                        </button>
                        <button
                            onClick={() => {
                                const defaultFilters = {
                                    search: '',
                                    category: '',
                                    from: '',
                                    to: '',
                                    branch: user?.branch_id || ''
                                };
                                setFilters(defaultFilters);
                            }}
                            className="rounded bg-gray-300 text-gray-800 px-4 py-1 hover:bg-gray-400 text-sm"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                <ExportButton data={exportData} merges={merges} filename="Inventory_Report" sheetName="Inventory" />

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border border-gray-200">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-2 border " rowSpan={2}>Code</th>
                                <th className="px-4 py-2 border " rowSpan={2}>Name</th>
                                <th className="py-2 border text-center" colSpan={4}>Stock In</th>
                                <th className="py-2 border text-center" colSpan={4}>Stock Out</th>
                                <th className="px-2 py-2 border text-center" rowSpan={2}>Current Unit</th>
                            </tr>
                            <tr>
                                <th className="px-4 py-2 border text-center">Date</th>
                                <th className="px-4 py-2 border text-center">Type</th>
                                <th className="px-4 py-2 border text-center">From</th>
                                <th className="px-4 py-2 border text-center">Qty</th>
                                <th className="px-4 py-2 border text-center">Date</th>
                                <th className="px-4 py-2 border text-center">Type</th>
                                <th className="px-4 py-2 border text-center">Purpose</th>
                                <th className="px-4 py-2 border text-center">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report?.map((item, index) => {

                                const branch = item.branch_values[0];
                                const assetIns = branch.asset_in || [];
                                const assetOuts = branch.asset_out || [];
                                const maxRows = Math.max(assetIns.length, assetOuts.length, 1); // At least 1 row

                                return [...Array(maxRows)].map((_, i) => {
                                    const assetIn = assetIns[i];
                                    const assetOut = assetOuts[i];

                                    return (
                                        <tr key={`${item.id}-${i}`} className="text-sm border-t hover:bg-gray-50">
                                            {i === 0 && (
                                                <td className="px-4 py-2 border" rowSpan={maxRows}>
                                                    {item.asset_running_number}
                                                </td>
                                            )}
                                            {i === 0 && (
                                                <td className="px-4 py-2 border" rowSpan={maxRows}>
                                                    {item.name}
                                                </td>
                                            )}

                                            <td className="px-4 py-2 border hover:underline hover:cursor-pointer"
                                                onClick={() => handleOpenTransaction(assetIn?.transaction_id)}>{assetIn ? new Date(assetIn.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-2 py-2 border text-center">
                                                {assetIn?.asset_transaction_type === 'ASSET IN' ? 'MKT IN' :
                                                    assetIn?.asset_transaction_type === 'ASSET TRANSFER' ? 'TRANSFER' : (assetIn?.asset_transaction_type || '-')}
                                            </td>

                                            <td className="px-4 py-2 border">{assetIn?.supplier_name || assetIn?.assets_from_branch_name || '-'}</td>
                                            <td className="px-4 py-2 border text-center">{assetIn?.asset_unit ?? '-'}</td>

                                            <td className="px-4 py-2 border hover:underline hover:cursor-pointer"
                                                onClick={() => handleOpenTransaction(assetOut?.transaction_id)}>
                                                {assetOut ? new Date(assetOut.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-2 py-2 border text-center">
                                                {assetOut?.asset_transaction_type === 'ASSET OUT' ? 'INVOICE' :
                                                    assetOut?.asset_transaction_type === 'ASSET TRANSFER' ? 'TRANSFER' : (assetOut?.asset_transaction_type || '-')}
                                            </td>
                                            <td className="px-4 py-2 border">{assetOut?.asset_transaction_purpose_name || '-'}</td>
                                            <td className="px-4 py-2 border text-center">{assetOut?.asset_unit ?? '-'}</td>

                                            {i === 0 && (
                                                <td className="px-4 py-2 border text-center" rowSpan={maxRows}>
                                                    {branch?.asset_current_unit}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                });
                            })}
                        </tbody>
                    </table>
                    <Pagination
                        pagination={pagination}
                        onPageChange={(page) => fetchReport(filters, page)}
                    />
                </div>
            </div>

            {isOpen && (
                <TransactionModalWrapper
                    id={txnId}
                    isOpen={isOpen}
                    onClose={closeModal}
                />
            )}
        </Layout>
    );
}

export default InventoryReport;
