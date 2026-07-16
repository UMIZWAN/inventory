import React, { useEffect, useState } from 'react';
import api from '../api/api';
import ExportButton from './ExportButton';
import TransactionModalWrapper from './TransactionModalWrapper';

function ItemReport({ id, branchId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txnId, setTxnId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchReport() {
      setLoading(true);
      try {
        const response = await api.get('/api/report/item', {
          params: { id, branch_id: branchId }
        });
        if (!cancelled) setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch item report:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id && branchId) fetchReport();
    return () => { cancelled = true; };
  }, [id, branchId]);

  if (loading) return <div className="bg-white p-6 rounded-2xl shadow text-sm text-gray-500">Loading report...</div>;
  if (!data) return <div className="bg-white p-6 rounded-2xl shadow text-sm text-gray-500">No report data found.</div>;

  const branch = data.branch_values[0] || {};
  const assetIns = branch.asset_in || [];
  const assetOuts = branch.asset_out || [];
  const branchLog = branch.branch_value_log || [];
  const maxRows = Math.max(assetIns.length, assetOuts.length, 1);

  const exportData = [];
  const merges = [];

  let rowIndex = 1; // Excel header is row 0

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
    merges.push(
      { s: { r: rowIndex, c: 0 }, e: { r: rowIndex + maxRows - 1, c: 0 } },
      { s: { r: rowIndex, c: 1 }, e: { r: rowIndex + maxRows - 1, c: 1 } },
      { s: { r: rowIndex, c: 10 }, e: { r: rowIndex + maxRows - 1, c: 10 } }
    );
  }

  const handleOpenTransaction = (id) => {
    setTxnId(id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTxnId(null);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow space-y-4">
        <div className='flex justify-between items-center mb-4'>
          <h2 className="text-2xl font-bold uppercase">Item Report</h2>
          <ExportButton
            data={exportData}
            merges={merges}
            filename={`Item_Report_${data.asset_running_number}`}
            sheetName="TransactionHistory"
          />
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
                    <td className="px-4 py-2 border hover:underline hover:cursor-pointer" onClick={() => handleOpenTransaction(inTx?.transaction_id)}>
                      {inTx?.created_at ? new Date(inTx.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-2 border">{inTx?.asset_transaction_type || '-'}</td>
                    <td className="px-4 py-2 border">{inTx?.supplier_name || inTx?.assets_from_branch_name || '-'}</td>
                    <td className="px-4 py-2 border text-center">{inTx?.asset_unit ?? '-'}</td>
                    <td className="px-4 py-2 border hover:underline hover:cursor-pointer" onClick={() => handleOpenTransaction(outTx?.transaction_id)}>
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
        {branchLog.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Stock Movement Log</h3>
            <ul className="text-xs text-gray-400 max-h-48 overflow-y-auto space-y-0.5">
              {[...branchLog].reverse().map((log, idx) => (
                <li key={idx}>&#183; {log.message} ({log.timestamp})</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {isOpen && (
        <TransactionModalWrapper
          id={txnId}
          isOpen={isOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}

export default ItemReport;
