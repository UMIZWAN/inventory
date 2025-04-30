import { useState } from "react";
import api from "../api/api";
import { Dialog } from "@headlessui/react";
import TransferForm from "./TransferForm";
import TransferDetailModal from "./TransferDetailModal";
import { useAssetMeta } from "../context/AssetsContext";
import { useAuth } from "../context/AuthContext";

export default function TransferList({ status, mode }) {
  const { user } = useAuth();
  const { assetTransfer, createTransfer } = useAssetMeta();
  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const openModal = (txn) => {
    if (status === "DRAFT") {
      // For draft items, show in edit mode
      setSelected({
        ...txn,
        items: txn.assets_transaction_item_list.map(item => ({
          item: item.asset_id,
          quantity: item.asset_unit,
          price: 0, // You might need to fetch this from asset data
          category: "", // You might need to fetch this from asset data
          unitMeasure: "" // You might need to fetch this from asset data
        })),
        purpose: txn.assets_transaction_purpose ? [txn.assets_transaction_purpose] : [],
        remarks: txn.assets_transaction_remark || "",
        date: txn.created_at.slice(0, 10),
        fromBranch: txn.assets_from_branch_id,
        toBranch: txn.assets_to_branch_id,
        status: txn.assets_transaction_status
      });
      setIsEditing(true);
    } else {
      // For non-draft items, show in view mode
      setSelected(txn);
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsEditing(false);
    setSelected(null);
  };

  const handleUpdateDraft = async (updatedForm) => {
    try {
      const payload = {
        ...selected,
        assets_transaction_status: updatedForm.status,
        assets_from_branch_id: updatedForm.fromBranch,
        assets_to_branch_id: updatedForm.toBranch,
        created_at: updatedForm.date,
        assets_transaction_remark: updatedForm.remarks,
        assets_transaction_purpose: updatedForm.purpose.join(", "),
        assets_transaction_item_list: updatedForm.items.map((item) => ({
          asset_id: parseInt(item.item),
          asset_unit: parseInt(item.quantity),
          status: null,
        })),
      };

      await api.put(`/api/assets-transaction/${selected.id}`, payload);
      closeModal();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleAction = (newStatus) => {
    api.put(`/api/assets-transaction/${selected.id}`, {
      ...selected,
      assets_transaction_status: newStatus,
    }).then(() => {
      closeModal();
    }).catch((err) => {
      console.error("Update failed:", err);
    });
  };

  // Filter based on status prop and searchTerm
  const filteredTransfers = assetTransfer.filter((txn) => {
    const matchesStatus = !status || txn.assets_transaction_status === status;

    // Check if the transfer matches the mode
    let matchesMode = true;
    if (mode === "outgoing") {
      matchesMode = txn.assets_from_branch_id === user?.branch_id;
    } else if (mode === "incoming") {
      matchesMode = txn.assets_to_branch_id === user?.branch_id;
    }

    const matchesSearch = txn.assets_transaction_running_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.assets_transaction_item_list.some(item =>
        item.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesStatus && matchesMode && matchesSearch;
  });

  // Determine which buttons to show based on status
  const getModalButtons = () => {
    if (!selected) return null;

    switch (selected.assets_transaction_status) {
      case "DRAFT":
        return {
          primary: {
            label: "Start Transfer",
            action: () => handleAction("IN-TRANSFER"),
            color: "bg-blue-600 hover:bg-blue-700"
          }
        };
      case "IN-TRANSFER":
        return {
          primary: {
            label: "Mark as Received",
            action: () => handleAction("RECEIVED"),
            color: "bg-green-600 hover:bg-green-700"
          }
        };
      default:
        return null;
    }
  };

  const modalButtons = getModalButtons();

  return (
    <>
      {showTransferForm && (
        <TransferForm
          setShowTransferForm={setShowTransferForm}
          initialData={null}
          onSubmit={createTransfer}
        />
      )}

      {isEditing && selected && (
        <TransferForm
          setShowTransferForm={setIsEditing}
          initialData={selected}
          onSubmit={handleUpdateDraft}
          isEditMode={true}
        />
      )}

      <div className="overflow-x-auto bg-white shadow rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Transfer List</h1>
          {status === "IN-TRANSFER" && user?.add_edit_transaction && (
            <button
              onClick={() => setShowTransferForm(true)}
              className="rounded-full bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 text-sm flex items-center gap-2"
            >
              + New Transfer
            </button>
          )}

        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Search by running number or item status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full sm:w-72"
          />
        </div>

        {/* Table */}
        <table className="min-w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-2 border">Running No</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">From ➔ To Branch</th>
              <th className="px-4 py-2 border">Created By</th>
              <th className="px-4 py-2 border">Created At</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {filteredTransfers.length > 0 ? (
              filteredTransfers.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td
                    className="px-4 py-2 border hover:underline font-medium cursor-pointer"
                    onClick={() => openModal(txn)}
                  >
                    {txn.assets_transaction_running_number}
                  </td>
                  <td className="px-4 py-2 border">{txn.assets_transaction_type}</td>
                  <td className="px-4 py-2 border">
                    {txn.assets_from_branch_name} ➔ {txn.assets_to_branch_name}
                  </td>
                  <td className="px-4 py-2 border">{txn.created_by_name}</td>
                  <td className="px-4 py-2 border">{new Date(txn.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${txn.assets_transaction_status === "DRAFT" ? "bg-yellow-100 text-yellow-800" :
                      txn.assets_transaction_status === "IN-TRANSFER" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                      {txn.assets_transaction_status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-400">
                  No transfer records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for non-draft items */}
      <TransferDetailModal
        isOpen={isOpen}
        onClose={closeModal}
        data={selected}
        buttons={modalButtons}
        mode={mode}  // Add this line
      />
    </>
  );
}