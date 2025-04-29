import React from "react";
import Layout from "../../components/layout/Layout";
import { useAssetMeta } from "../../context/AssetsContext";

function ReceiveHistory() {
  const { assetIn } = useAssetMeta();
  console.log(assetIn);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Receive History</h1>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">Branch</th>
              {/* <th className="px-4 py-2 border">Asset Details</th> */}
              <th className="px-4 py-2 border">Remarks</th>
              <th className="px-4 py-2 border">Running Number</th>
              <th className="px-4 py-2 border">Transaction Type</th>
              <th className="px-4 py-2 border">Received By</th>
              {/* <th className="px-4 py-2 border">Received At</th> */}
            </tr>
          </thead>
          <tbody>
            {assetIn.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-2 border">{transaction.assets_to_branch_name}</td>
                {/* <td className="px-4 py-2 border">
                  {transaction.assets_transaction_item_list.map((item, index) => (
                    <div key={index}>
                      Asset ID: {item.asset_id} - Status: {item.status}
                    </div>
                  ))}
                </td> */}
                <td className="px-4 py-2 border">{transaction.assets_transaction_remark}</td>
                <td className="px-4 py-2 border">{transaction.assets_transaction_running_number}</td>
                <td className="px-4 py-2 border">{transaction.assets_transaction_type}</td>
                <td className="px-4 py-2 border">{transaction.received_by_name}</td>
                {/* <td className="px-4 py-2 border">{new Date(transaction.received_at).toLocaleString()}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default ReceiveHistory;
