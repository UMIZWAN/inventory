import React from "react";
import Layout from "../../components/layout/Layout";

function ReceiveHistory() {
  const mockHistory = [
    {
      id: 1,
      referenceNo: "REF-001",
      branch: "Main Warehouse",
      supplier: "ABC Supplies",
      receiveDate: "2025-04-20",
      itemCount: 3,
      totalCost: 1500.75,
    },
    {
      id: 2,
      referenceNo: "REF-002",
      branch: "Kota Kinabalu",
      supplier: "XYZ Traders",
      receiveDate: "2025-04-22",
      itemCount: 2,
      totalCost: 890.0,
    },
    {
      id: 3,
      referenceNo: "REF-003",
      branch: "Sandakan Branch",
      supplier: "LMN Enterprise",
      receiveDate: "2025-04-23",
      itemCount: 5,
      totalCost: 2340.5,
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Receive History</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300">
            <thead className="bg-gray-100 text-sm text-left">
              <tr>
                <th className="px-4 py-2 border-b">Reference No.</th>
                <th className="px-4 py-2 border-b">Supplier</th>
                <th className="px-4 py-2 border-b">Branch</th>
                <th className="px-4 py-2 border-b">Receive Date</th>
                <th className="px-4 py-2 border-b text-right">Items</th>
                <th className="px-4 py-2 border-b text-right">Total Cost (RM)</th>
              </tr>
            </thead>
            <tbody>
              {mockHistory.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{entry.referenceNo}</td>
                  <td className="px-4 py-2 border-b">{entry.supplier}</td>
                  <td className="px-4 py-2 border-b">{entry.branch}</td>
                  <td className="px-4 py-2 border-b">{new Date(entry.receiveDate).toISOString().slice(0, 10)}</td>
                  <td className="px-4 py-2 border-b text-right">{entry.itemCount}</td>
                  <td className="px-4 py-2 border-b text-right">{entry.totalCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default ReceiveHistory;
