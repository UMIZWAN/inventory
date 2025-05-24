import React, { useEffect } from 'react';
import { useAssetMeta } from '../../context/AssetsContext';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';


function InventoryReport() {
    const { user } = useAuth();
    const { report, fetchReport } = useAssetMeta();

    useEffect(() => {
        fetchReport(user?.branch_id);
    }, []);

    return (
        <Layout>
            <div className="overflow-x-auto bg-white shadow rounded-lg p-4 space-y-4 mt-4">
                <h1 className="text-2xl font-bold mb-4">Inventory Report</h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border border-gray-200">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-2 border border-b-0">Code</th>
                                <th className="px-4 py-2 border border-b-0">Name</th>
                                <th className="px-4 py-2 border border-r-0"></th>
                                <th className="py-2 border border-r-0 border-l-0 text-right">Stock</th>
                                <th className="px-1 py-2 border border-r-0 border-l-0 text-left">In</th>
                                <th className="px-4 py-2 border border-r-0 border-l-0"></th>
                                <th className="px-4 py-2 border border-r-0"></th>
                                <th className="py-2 border border-r-0 border-l-0 text-right">Stock</th>
                                <th className="px-1 py-2 border border-r-0 border-l-0 text-left">out</th>
                                <th className="px-4 py-2 border border-r-0 border-l-0"></th>
                                <th className="px-2 py-2 border border-b-0 text-center">Current Unit</th>
                            </tr>
                            <tr>
                                <th className="px-4 py-2 border border-t-0"></th>
                                <th className="px-4 py-2 border border-t-0"></th>
                                <th className="px-4 py-2 border text-center">Date</th>
                                <th className="px-4 py-2 border text-center">Type</th>
                                <th className="px-4 py-2 border text-center">From</th>
                                <th className="px-4 py-2 border text-center">Qty</th>
                                <th className="px-4 py-2 border text-center">Date</th>
                                <th className="px-4 py-2 border text-center">Type</th>
                                <th className="px-4 py-2 border text-center">Purpose</th>
                                <th className="px-4 py-2 border text-center">Qty</th>
                                <th className="px-4 py-2 border border-t-0"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {report?.map((item, index) => {
                                const branch = item.branch_values[0];
                                const assetIn = branch.asset_in?.[0];
                                const assetOut = branch.asset_out?.[0];

                                return (
                                    <tr key={item.id} className="text-sm border-t hover:bg-gray-50">
                                        <td className="px-4 py-2 border">{item.asset_running_number}</td>
                                        <td className="px-4 py-2 border">{item.name}</td>
                                        <td className="px-4 py-2 border">{new Date(assetIn?.created_at).toLocaleDateString() || '-'}</td>
                                        <td className="px-2 py-2 border text-center">{assetIn?.asset_transaction_type}</td>
                                        <td className="px-4 py-2 border">{assetIn?.assets_from_branch_id}</td>
                                        <td className="px-4 py-2 border text-center">{assetIn?.asset_unit}</td>
                                        <td className="px-4 py-2 border">{new Date(assetOut?.created_at).toLocaleDateString()}</td>
                                        <td className="px-2 py-2 border text-center">{assetOut?.asset_transaction_type}</td>
                                        <td className="px-4 py-2 border">{assetOut?.asset_transaction_purpose_name}</td>
                                        <td className="px-4 py-2 border text-center">{assetOut?.asset_unit}</td>
                                        <td className="px-4 py-2 border text-center">{branch?.asset_current_unit}</td>
                                        {/* <td className="px-4 py-2 border text-xs">
                                            {assetIn ? (
                                                <>
                                                    <div>{assetIn.asset_transaction_type}</div>
                                                    <div>{new Date(assetIn.created_at).toLocaleString()}</div>
                                                    <div>Unit: {assetIn.asset_unit}</div>
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border text-xs">
                                            {assetOut ? (
                                                <>
                                                    <div>{assetOut.asset_transaction_type}</div>
                                                    <div>{new Date(assetOut.created_at).toLocaleString()}</div>
                                                    <div>Unit: {assetOut.asset_unit}</div>
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </td> */}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}

export default InventoryReport;
