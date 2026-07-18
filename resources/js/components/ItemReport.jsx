import React, { useEffect, useState } from 'react';
import api from '../api/api';
import ExportButton from './ExportButton';
import TransactionModalWrapper from './TransactionModalWrapper';
import { useAuth } from '../context/AuthContext';

function ItemReport({ id, branchId }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txnId, setTxnId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [amending, setAmending] = useState(false);

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
  }, [id, branchId, refreshKey]);

  const handleAmend = async () => {
    if (!confirm('Create an amend transaction so the transaction total matches the current quantity? This does not change stock.')) return;
    setAmending(true);
    try {
      const res = await api.post('/api/report/item/amend', { asset_id: id, branch_id: branchId });
      if (res.data.success) {
        setRefreshKey(k => k + 1);
      } else {
        alert(res.data.message || 'Amend failed');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Amend failed');
    } finally {
      setAmending(false);
    }
  };

  if (loading) return <div className="border border-gray-200 bg-white p-6 rounded-2xl text-sm text-gray-500">Loading report...</div>;
  if (!data) return <div className="border border-gray-200 bg-white p-6 rounded-2xl text-sm text-gray-500">No report data found.</div>;

  const branch = data.branch_values[0] || {};
  const assetIns = branch.asset_in || [];
  const assetOuts = branch.asset_out || [];
  const branchLog = branch.branch_value_log || [];
  const maxRows = Math.max(assetIns.length, assetOuts.length, 1);

  const currentQty = Number(branch.asset_current_unit) || 0;
  const totalFromTable =
    assetIns.reduce((sum, tx) => sum + (Number(tx.asset_unit) || 0), 0) -
    assetOuts.reduce((sum, tx) => sum + (Number(tx.asset_unit) || 0), 0);
  const qtyMatches = currentQty === totalFromTable;

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
      <div className="border border-gray-200 bg-white p-6 rounded-2xl space-y-4">
        <div className='flex justify-between items-center mb-4'>
          <h2 className="text-2xl font-bold uppercase">Item Report</h2>
          <ExportButton
            data={exportData}
            merges={merges}
            filename={`Item_Report_${data.asset_running_number}`}
            sheetName="TransactionHistory"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${qtyMatches ? 'text-green-600' : 'text-red-600'}`}>
            Current Quantity: {currentQty} || {totalFromTable} (Total From Transaction)
          </span>
          {!qtyMatches && user?.add_edit_asset && (
            <button
              onClick={handleAmend}
              disabled={amending}
              className="inline-flex items-center justify-center gap-1 bg-white shadow-sm shadow-amber-600/30 px-3 py-0.5 rounded-full text-[11px] text-amber-600 hover:text-amber-800 disabled:opacity-50"
            >
              {amending ? 'Amending…' : 'Amend'}
            </button>
          )}
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
