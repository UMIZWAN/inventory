import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import Layout from '../../components/layout/Layout';

function SingleItemReport({ id, branch_id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await api.get('/api/report/item', {
          params: { id, branch_id }
        });
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch item report:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [id, branch_id]);

  if (loading) return <Layout><p className="p-4">Loading...</p></Layout>;
  if (!data) return <Layout><p className="p-4">No data found.</p></Layout>;

  const branch = data.branch_values[0] || {};
  const assetIns = branch.asset_in || [];
  const assetOuts = branch.asset_out || [];
  const maxRows = Math.max(assetIns.length, assetOuts.length, 1);

  return (
    <Layout>
      <div className="bg-white p-6 rounded shadow mt-6 space-y-4">
        <h2 className="text-2xl font-bold">Item Report</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-m">
          <div><strong>Code:</strong> {data.asset_running_number}</div>
          <div><strong>Name:</strong> {data.name}</div>
          <div><strong>Current Unit:</strong> {branch.asset_current_unit}</div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm text-left border border-gray-300">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-2 border">Stock In Date</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">From</th>
                <th className="px-4 py-2 border">Qty</th>
                <th className="px-4 py-2 border">Stock Out Date</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Purpose</th>
                <th className="px-4 py-2 border">Qty</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(maxRows)].map((_, i) => {
                const inTx = assetIns[i];
                const outTx = assetOuts[i];
                return (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2 border">{inTx?.created_at ? new Date(inTx.created_at).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2 border">{inTx?.asset_transaction_type || '-'}</td>
                    <td className="px-4 py-2 border">{inTx?.supplier_name || inTx?.assets_from_branch_name || '-'}</td>
                    <td className="px-4 py-2 border text-center">{inTx?.asset_unit ?? '-'}</td>
                    <td className="px-4 py-2 border">{outTx?.created_at ? new Date(outTx.created_at).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2 border">{outTx?.asset_transaction_type || '-'}</td>
                    <td className="px-4 py-2 border">{outTx?.asset_transaction_purpose_name || '-'}</td>
                    <td className="px-4 py-2 border text-center">{outTx?.asset_unit ?? '-'}</td>
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

export default SingleItemReport;
