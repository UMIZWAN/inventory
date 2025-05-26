import React, { useState, useEffect } from 'react';
import { useAssetMeta } from '../../context/AssetsContext';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';


function InventoryReport() {
    const { user } = useAuth();
    const { report, fetchReport,
        categories, fetchCategories,
        branches, fetchBranches, } = useAssetMeta();
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        from: '',
        to: '',
    });

    useEffect(() => {
        fetchReport(user?.branch_id);
        fetchCategories();
        fetchBranches();
    }, []);

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
                    <button className="rounded bg-blue-600 text-white px-4 py-1 hover:bg-blue-700 text-sm cursor-pointer mt-2">Apply</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border border-gray-200">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-2 border border-b-0" rowSpan={2}>Code</th>
                                <th className="px-4 py-2 border border-b-0" rowSpan={2}>Name</th>
                                <th className="py-2 border text-center" colSpan={4}>Stock In</th>
                                <th className="py-2 border text-center" colSpan={4}>Stock Out</th>
                                <th className="px-2 py-2 border border-b-0 text-center" rowSpan={2}>Current Unit</th>
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
                            {report
                                ?.filter((item) => {
                                    const searchMatch = item.asset_running_number.toLowerCase().includes(filters.search.toLowerCase()) ||
                                        item.name.toLowerCase().includes(filters.search.toLowerCase());

                                    const categoryMatch = !filters.category || item.asset_category_id == filters.category;

                                    const fromDate = filters.from ? new Date(filters.from) : null;
                                    const toDate = filters.to ? new Date(filters.to) : null;

                                    const inDates = item.branch_values[0]?.asset_in?.map((a) => new Date(a.created_at)) || [];
                                    const outDates = item.branch_values[0]?.asset_out?.map((a) => new Date(a.created_at)) || [];
                                    const allDates = [...inDates, ...outDates];

                                    const dateMatch = allDates.some((d) => {
                                        return (!fromDate || d >= fromDate) && (!toDate || d <= toDate);
                                    });

                                    return searchMatch && categoryMatch && (filters.from || filters.to ? dateMatch : true);
                                })
                                .map((item, index) => {

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

                                                <td className="px-4 py-2 border">{assetIn ? new Date(assetIn.created_at).toLocaleDateString() : '-'}</td>
                                                <td className="px-2 py-2 border text-center">{assetIn?.asset_transaction_type || '-'}</td>
                                                <td className="px-4 py-2 border">{assetIn?.supplier_name || assetIn?.assets_from_branch_name || '-'}</td>
                                                <td className="px-4 py-2 border text-center">{assetIn?.asset_unit ?? '-'}</td>

                                                <td className="px-4 py-2 border">{assetOut ? new Date(assetOut.created_at).toLocaleDateString() : '-'}</td>
                                                <td className="px-2 py-2 border text-center">{assetOut?.asset_transaction_type || '-'}</td>
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
                </div>
            </div>
        </Layout>
    );
}

export default InventoryReport;
