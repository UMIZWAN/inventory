import React from "react";
import Layout from "../../components/layout/Layout";
import { useAssetMeta } from "../../context/AssetsContext";

function CheckoutHistory() {
    const { assetOut } = useAssetMeta();
    console.log(assetOut);

    return (
        <Layout>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Asset Checkout History</h1>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2 border">Reference Number</th>
                            <th className="px-4 py-2 border">Branch</th>
                            {/* <th className="px-4 py-2 border">Asset Details</th> */}
                            <th className="px-4 py-2 border">Purpose</th>
                            <th className="px-4 py-2 border">Transaction Type</th>
                            <th className="px-4 py-2 border">Created By</th>
                            {/* <th className="px-4 py-2 border">Received At</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {assetOut.map((transaction) => (
                            <tr key={transaction.id}>
                                <td className="px-4 py-2 border">{transaction.assets_transaction_running_number}</td>
                                <td className="px-4 py-2 border">{transaction.assets_to_branch_name}</td>
                                {/* <td className="px-4 py-2 border">
                  {transaction.assets_transaction_item_list.map((item, index) => (
                    <div key={index}>
                      Asset ID: {item.asset_id} - Status: {item.status}
                    </div>
                  ))}
                </td> */}
                                <td className="px-4 py-2 border">
                                    {transaction.assets_transaction_purpose
                                        ? JSON.parse(transaction.assets_transaction_purpose).join(", ")
                                        : "-"}
                                </td>
                                <td className="px-4 py-2 border">{transaction.assets_transaction_type}</td>
                                <td className="px-4 py-2 border">{transaction.created_by_name}</td>
                                {/* <td className="px-4 py-2 border">{new Date(transaction.received_at).toLocaleString()}</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}

export default CheckoutHistory;
