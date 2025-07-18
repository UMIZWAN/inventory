import { useState, useEffect } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import api from "../api/api";
import TransferForm from "../Pages/Items/TransferForm";
import TransferDetailModal from "./TransferDetailModal";
import { useAssetMeta } from "../context/AssetsContext";
import { useAuth } from "../context/AuthContext";
import TransactionFilter from "./TransactionFilter";
import ExportButton from "./ExportButton";
import confirmAction from '../components/ConfirmModal';
import Swal from 'sweetalert2';

export default function TransferList({ status, mode }) {
  const { user, selectedBranch } = useAuth();
  const { assets, assetTransfer, createTransfer, fetchAssetTransfer, fetchBranchAssets } = useAssetMeta();

  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferStatus, setTransferStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [filters, setFilters] = useState({
    searchTerm: '',
    fromDate: '',
    toDate: '',
    fromBranch: '',
    toBranch: '',
    status: '',
    itemName: '',
  });

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const status = query.get('status');

    if (status) {
      setTransferStatus(status);
      setShowTransferForm(true);
    }
  }, []);

  const openModal = (txn) => {
    if (status === "DRAFT") {
      setSelected({
        ...txn,
        items: txn.assets_transaction_item_list.map(item => ({
          item: item.asset_id,
          quantity: item.asset_unit,
          price: 0,
          category: "",
          unitMeasure: ""
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
      setSelected(txn);
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsEditing(false);
    setSelected(null);
  };

  // const handleUpdateDraft = async (updatedForm) => {
  //   try {
  //     const payload = {
  //       ...selected,
  //       assets_transaction_status: updatedForm.status,
  //       assets_from_branch_id: updatedForm.fromBranch,
  //       assets_to_branch_id: updatedForm.toBranch,
  //       created_at: updatedForm.date,
  //       assets_transaction_remark: updatedForm.remarks,
  //       assets_transaction_purpose: updatedForm.purpose.join(", "),
  //       assets_transaction_item_list: updatedForm.items.map((item) => ({
  //         asset_id: parseInt(item.item),
  //         asset_unit: parseInt(item.quantity),
  //         status: null,
  //       })),
  //     };

  //     await api.put(`/api/assets-transaction/${selected.id}`, payload);
  //     closeModal();
  //   } catch (err) {
  //     console.error("Update failed:", err);
  //   }
  // };

  const handleAction = async (txn, newStatus, shippingId = null) => {
    const statusLabelMap = {
      RECEIVED: 'Receive',
      APPROVED: 'Approve',
      REJECTED: 'Reject',
      'IN-TRANSIT': 'Send',
    };

    const actionLabel = statusLabelMap[newStatus] || 'Perform';

    const confirm = await confirmAction({
      title: `Confirm ${actionLabel}?`,
      text: `Are you sure you want to ${actionLabel.toLowerCase()} this transaction?`,
      confirmButtonText: `Yes, ${actionLabel.toLowerCase()}`,
    });

    if (!confirm.isConfirmed) return;

    try {
      const payload = {
        assets_transaction_status: newStatus,
        assets_transaction_remark: txn.assets_transaction_remark || "",
      };

      if (newStatus === "IN-TRANSIT" && shippingId) {
        payload.assets_shipping_option_id = shippingId;
      }

      const res = await api.put(`/api/assets-transaction/${txn.id}`, payload);

      Swal.fire({
        icon: 'success',
        title: `${actionLabel}d!`,
        text: `Transaction successfully ${actionLabel.toLowerCase()}d.`,
        timer: 1500,
        showConfirmButton: false,
      });

      closeModal();
      fetchAssetTransfer({
        branch_id: selectedBranch?.branch_id,
        assets_transaction_type: "ASSET TRANSFER",
      });
      fetchBranchAssets({ branch_id: selectedBranch?.branch_id });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: err.response?.data?.error || 'Something went wrong.',
      });
    }
  };

  const filteredTransfers = assetTransfer.filter((txn) => {
    const txnDate = txn.created_at.slice(0, 10);
    const assetNames = txn.assets_transaction_item_list.map(item => {
      const found = assets.find(a => a.id === item.asset_id);
      return found?.name?.toLowerCase() || '';
    });

    const matchesSearch =
      !filters.searchTerm ||
      txn.assets_transaction_running_number?.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesItem =
      !filters.itemName ||
      assetNames.some(name => name.includes(filters.itemName.toLowerCase()));

    const matchesDate =
      (!filters.fromDate || txnDate >= filters.fromDate) &&
      (!filters.toDate || txnDate <= filters.toDate);

    const matchesStatus =
      !filters.status || txn.assets_transaction_status === filters.status;

    const matchesFromBranch =
      !filters.fromBranch || txn.assets_from_branch_id == filters.fromBranch;

    const matchesToBranch =
      !filters.toBranch || txn.assets_to_branch_id == filters.toBranch;

    // let matchesMode = true;
    // if (mode === "outgoing") {
    //   matchesMode = txn.assets_from_branch_id === selectedBranch?.branch_id;
    // } else if (mode === "incoming") {
    //   matchesMode = txn.assets_to_branch_id === user?.branch_id;
    // } else if (mode === "both") {
    //   matchesMode =
    //     txn.assets_from_branch_id === user?.branch_id ||
    //     txn.assets_to_branch_id === user?.branch_id;
    // }

    return (
      matchesSearch &&
      matchesItem &&
      matchesDate &&
      matchesStatus &&
      matchesFromBranch &&
      matchesToBranch
      // matchesMode
    );
  });

  const getAvailableActions = (txn, user) => {
    const status = txn.assets_transaction_status;
    const actions = [];

    if (status === "IN-TRANSIT" && txn.assets_to_branch_id === selectedBranch?.branch_id) {
      actions.push({
        label: "Receive",
        status: "RECEIVED",
        color: "bg-white shadow-sm shadow-lime-600/30 px-2 rounded text-lime-600 hover:bg-lime-100",
        icon: <IoMdCheckmarkCircleOutline className="inline-block mr-1 mb-1" />,
      });
    }

    if (status === "REQUESTED" && txn.assets_from_branch_id === selectedBranch?.branch_id && user.approve_reject_transaction) {
      actions.push({
        label: "Approve",
        status: "APPROVED",
        color: "bg-white shadow-sm shadow-blue-600/30 px-2 rounded text-blue-600 hover:bg-blue-100",
      });
      actions.push({
        label: "Reject",
        status: "REJECTED",
        color: "bg-white shadow-sm shadow-red-600/30 px-2 rounded text-red-600 hover:bg-red-100",
      });
    }

    if (status === "APPROVED" && txn.assets_from_branch_id === selectedBranch?.branch_id && user.approve_reject_transaction) {
      actions.push({
        label: "Send",
        status: "IN-TRANSIT",
        color: "bg-white shadow-sm shadow-indigo-600/30 px-2 rounded text-indigo-600 hover:bg-indigo-100",
      });
    }

    return actions;
  };

  const getModalButtons = () => {
    if (!selected) return null;
    const actions = getAvailableActions(selected, user);
    if (actions.length === 0) return null;

    const [primary, secondary] = actions;
    return {
      primary: primary && {
        label: primary.label,
        action: (shippingId) =>
          handleAction(selected, primary.status, shippingId),
        color: primary.color,
      },
      secondary: secondary && {
        label: secondary.label,
        action: () => handleAction(selected, secondary.status),
        color: secondary.color,
      },
    };
  };

  const modalButtons = getModalButtons();

  const getStatusStyle = (status) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "IN-TRANSIT":
        return "bg-indigo-100 text-indigo-800";
      case "RECEIVED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      {showTransferForm?.show && (
        <TransferForm
          setShowTransferForm={setShowTransferForm}
          initialData={{ status: showTransferForm.status }}
          onSubmit={createTransfer}
          status={transferStatus}
        />
      )}

      {/* {isEditing && selected && (
        <TransferForm
          setShowTransferForm={setIsEditing}
          initialData={selected}
          onSubmit={handleUpdateDraft}
          isEditMode={true}
        />
      )} */}

      <div className="overflow-x-auto bg-white shadow rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Transfer List</h1>
          {/* <div className="flex items-center gap-2">
            {user?.add_edit_transaction && (
              <a
                href="/items/asset-transfer?status=REQUESTED"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTransferForm({ show: true, status: "REQUESTED" });
                }}
                className="rounded-full bg-amber-400 text-white px-4 py-2 hover:bg-amber-500 text-sm flex items-center gap-2 cursor-pointer"
              >
                + Request
              </a>
            )}
            {user?.add_edit_transaction && (
              <a
                href="/items/asset-transfer?status=IN-TRANSIT"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTransferForm({ show: true, status: "IN-TRANSIT" });
                }}
                className="rounded-full bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 text-sm flex items-center gap-2 cursor-pointer"
              >
                + Transfer
              </a>
            )}
          </div> */}
        </div>

        <TransactionFilter
          filterType="transfer"
          onFilterChange={(f) => setFilters(f)}
        />

        {user?.download_reports && (
          <ExportButton
            data={filteredTransfers.flatMap((txn) =>
              txn.assets_transaction_item_list.map((item) => ({
                "Running No": txn.assets_transaction_running_number,
                "Type": txn.assets_transaction_type,
                "From Branch": txn.assets_from_branch_name,
                "To Branch": txn.assets_to_branch_name,
                "Item": item.asset_name || "Unknown",
                "Quantity": item.asset_unit || 0,
                "Unit Price": (Number(item.assets.asset_sales_cost) || 0).toFixed(2),
                "Total Price": ((Number(item.asset_unit) || 0) * (Number(item.assets.asset_sales_cost) || 0)).toFixed(2),
                "Purpose": (() => {
                  const val = txn.asset_transaction_purpose_name;
                  try {
                    const parsed = JSON.parse(val);
                    return Array.isArray(parsed) ? parsed.join(", ") : val;
                  } catch {
                    return val || "-";
                  }
                })(),
                "Status": txn.assets_transaction_status,
                "Date": new Date(txn.created_at).toLocaleDateString("en-US"),
                "Remark": txn.assets_transaction_remark || "",
              }))
            )}
            filename="AssetTransfers"
            sheetName="Transfers"
          />
        )}



        <table className="min-w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-2 border">Reference No</th>
              {/* <th className="px-4 py-2 border">Type</th> */}
              <th className="px-4 py-2 border">From ➔ To Branch</th>
              <th className="px-4 py-2 border">Items</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Action</th>
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
                  {/* <td className="px-4 py-2 border">{txn.assets_transaction_type}</td> */}
                  <td className="px-4 py-2 border">
                    {(txn.assets_transaction_status === 'REQUESTED' ||
                      txn.assets_transaction_status === 'APPROVED' ||
                      txn.assets_transaction_status === 'REJECTED') ? (
                      <>
                        {txn.assets_to_branch_name} ← {txn.assets_from_branch_name}
                      </>
                    ) : (
                      <>
                        {txn.assets_from_branch_name} ➔ {txn.assets_to_branch_name}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="space-y-4 mt-2">
                      {txn.assets_transaction_item_list.map((item, index) => {
                        return (
                          <ul key={index} className="list-disc list-inside text-sm text-gray-800 mb-1">
                            <li>{item.asset_name} — {item.asset_unit}</li>
                          </ul>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-2 border">{new Date(txn.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(txn.assets_transaction_status)}`}>
                      {txn.assets_transaction_status}
                    </span>
                    <p className="text-xs italic mt-1 text-gray-600">
                      By: {
                        txn.assets_transaction_status === "RECEIVED"
                          ? txn.received_by_name
                          : txn.assets_transaction_status === "APPROVED"
                            ? txn.approved_by_name
                            : txn.assets_transaction_status === "REJECTED"
                              ? txn.rejected_by_name
                              : txn.created_by_name
                      }
                    </p>
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() => openModal(txn)}
                      className="bg-white shadow-sm shadow-blue-600/30 px-2 rounded text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>

                    {getAvailableActions(txn, user).map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(txn, action.status)}
                        className={action.color}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
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

      <TransferDetailModal
        isOpen={isOpen}
        onClose={closeModal}
        data={selected}
        buttons={modalButtons}
        mode={mode}
      />
    </>
  );
}
