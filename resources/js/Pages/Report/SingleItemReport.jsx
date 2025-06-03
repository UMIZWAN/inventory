import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import Layout from '../../components/layout/Layout';
import ExportButton from '../../components/ExportButton';
import TransactionModalWrapper from '../../components/TransactionModalWrapper';

function SingleItemReport({ id, branch_id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txnId, setTxnId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

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

  const exportData = [];
  const merges = [];

  let rowIndex = 1; // Excel header is row 0

  if (data && branch) {
    const assetIns = branch.asset_in || [];
    const assetOuts = branch.asset_out || [];
    const maxRows = Math.max(assetIns.length, assetOuts.length, 1);

    for (let i = 0; i < maxRows; i++) {
      const assetIn = assetIns[i] || {};
      const assetOut = assetOuts[i] || {};

      exportData.push({
        Code: i === 0 ? data.asset_running_number : '',
        Name: i === 0 ? data.name : '',
        "Stock In Date": assetIn.created_at ? new Date(assetIn.created_at).toLocaleDateString() : '',
        "Stock In Type": assetIn.asset_transaction_type || '',
        "Stock In From": assetIn.supplier_name || assetIn.assets_from_branch_name || '',
        "Stock In Qty": assetIn.asset_unit || '',
        "Stock Out Date": assetOut.created_at ? new Date(assetOut.created_at).toLocaleDateString() : '',
        "Stock Out Type": assetOut.asset_transaction_type || '',
        "Stock Out Purpose": assetOut.asset_transaction_purpose_name || '',
        "Stock Out Qty": assetOut.asset_unit || '',
        "Current Unit": i === 0 ? branch.asset_current_unit : '',
      });
    }

    if (maxRows > 1) {
      // Merge cells for Code (A), Name (B), Current Unit (K)
      merges.push(
        { s: { r: rowIndex, c: 0 }, e: { r: rowIndex + maxRows - 1, c: 0 } }, // A
        { s: { r: rowIndex, c: 1 }, e: { r: rowIndex + maxRows - 1, c: 1 } }, // B
        { s: { r: rowIndex, c: 10 }, e: { r: rowIndex + maxRows - 1, c: 10 } } // K
      );
    }
  }

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
      <div className="bg-white p-6 rounded shadow mt-6 space-y-4">
        <div className='flex justify-between items-center mb-4'>
          <h2 className="text-2xl font-bold">Item Report</h2>
          <ExportButton
            data={exportData}
            merges={merges}
            filename={`Item_Report_${data.asset_running_number}`}
            sheetName="TransactionHistory"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-m">
          <div><strong>Code:</strong> {data.asset_running_number}</div>
          <div><strong>Name:</strong> {data.name}</div>
          <div><strong>Current Unit:</strong> {branch.asset_current_unit}</div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm text-left border border-gray-300">
            <thead className="text-gray-700 uppercase text-xs">
              <tr>
                <th className="bg-green-100 px-4 py-2 border text-center" colSpan={4}>Stock In</th>
                <th className="bg-rose-100 px-4 py-2 border text-center" colSpan={4}>Stock Out</th>
              </tr>
              <tr>
                <th className="bg-green-100 px-4 py-2 border">Date</th>
                <th className="bg-green-100 px-4 py-2 border">Type</th>
                <th className="bg-green-100 px-4 py-2 border">From</th>
                <th className="bg-green-100 px-4 py-2 border text-center">Qty</th>
                <th className="bg-rose-100 px-4 py-2 border">Date</th>
                <th className="bg-rose-100 px-4 py-2 border">Type</th>
                <th className="bg-rose-100 px-4 py-2 border">Purpose</th>
                <th className="bg-rose-100 px-4 py-2 border text-center">Qty</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(maxRows)].map((_, i) => {
                const inTx = assetIns[i];
                const outTx = assetOuts[i];
                return (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2 border hover:underline" onClick={() => handleOpenTransaction(inTx?.transaction_id)}>
                      {inTx?.created_at ? new Date(inTx.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-2 border">{inTx?.asset_transaction_type || '-'}</td>
                    <td className="px-4 py-2 border">{inTx?.supplier_name || inTx?.assets_from_branch_name || '-'}</td>
                    <td className="px-4 py-2 border text-center">{inTx?.asset_unit ?? '-'}</td>
                    <td className="px-4 py-2 border hover:underline" onClick={() => handleOpenTransaction(outTx?.transaction_id)}>
                      {outTx?.created_at ? new Date(outTx.created_at).toLocaleDateString() : '-'}
                    </td>
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

export default SingleItemReport;
