import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useAssetMeta } from "../context/AssetsContext";
import { useAuth } from "../context/AuthContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import TransferDeliveryOrderPDF from "./TransferDeliveryOrderPDF";
import { useOptions } from "../context/OptionContext";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

export default function TransferDetailModal({ isOpen, onClose, data, buttons, mode }) {
  const { getCategoryById, assets } = useAssetMeta();
  const { user } = useAuth();
  const { shipping, fetchShipping } = useOptions();
  const [selectedShippingId, setSelectedShippingId] = useState(data?.assets_shipping_option_id || "");
  const [selectedItems, setSelectedItems] = useState([]);
  const [localItems, setLocalItems] = useState([]); // ✅ local copy to show real-time updates

  // Initialize data
  useEffect(() => {
    setSelectedShippingId(data?.assets_shipping_option_id || "");
    setSelectedItems([]);
    setLocalItems(data?.assets_transaction_item_list || []);
  }, [data]);

  useEffect(() => {
    fetchShipping();
  }, []);

  // ✅ Toggle checkbox selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // ✅ Select All toggle
  const toggleSelectAll = (checked) => {
    if (!localItems.length) return;
    if (checked) {
      setSelectedItems(localItems.map((i) => i.id));
    } else {
      setSelectedItems([]);
    }
  };

  const canSelectItem = (item) => {
    // ✅ Only APPROVED items selectable when sending, IN-TRANSIT when receiving
    if (["APPROVED", "IN-TRANSIT", "RECEIVED"].includes(data?.assets_transaction_status)) {
      return item.status === "APPROVED" || item.status === "IN-TRANSIT" || item.status === "RECEIVED";
    }
    return true;
  };

  // ✅ Apply visual status updates locally (for instant feedback)
  const updateLocalStatuses = (newStatus) => {
    const updated = localItems.map((item) => {
      const isSelected = selectedItems.includes(item.id);
      if (newStatus === "APPROVED") {
        // Approve selected, reject unselected
        return { ...item, status: isSelected ? "APPROVED" : "REJECTED" };
      }
      if (newStatus === "REJECTED") {
        // Reject selected, approve unselected (your request)
        return { ...item, status: isSelected ? "REJECTED" : "APPROVED" };
      }
      return item;
    });
    setLocalItems(updated);
  };

  const handlePrimaryAction = () => {
    const actionLabel = buttons.primary.label.toUpperCase();

    if (actionLabel === "SEND") {
      if (!selectedShippingId) {
        alert("Please select a shipping option before sending.");
        return;
      }
      if (selectedItems.length === 0) {
        alert("Please select at least one item to send.");
        return;
      }
      buttons.primary.action(selectedItems, selectedShippingId);
    } else if (["APPROVE", "REJECT"].includes(actionLabel)) {
      // ✅ Update local statuses instantly
      updateLocalStatuses(actionLabel);
      buttons.primary.action(selectedItems);
    } else {
      buttons.primary.action(selectedItems);
    }
  };

  // ✅ Get color + icon for item status
  const getStatusDisplay = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center text-green-600 font-medium gap-1">
            <FaCheckCircle /> {status}
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center text-red-600 font-medium gap-1">
            <FaTimesCircle /> {status}
          </span>
        );
      case "IN-TRANSIT":
        return (
          <span className="flex items-center text-indigo-600 font-medium gap-1">
            <FaClock /> {status}
          </span>
        );
      default:
        return <span className="text-gray-600">{status}</span>;
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100" leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">

              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                {/* Close */}
                <button
                  type="button"
                  className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  aria-label="Close"
                  onClick={onClose}
                >
                  &times;
                </button>

                {/* Header */}
                <div className="flex justify-between mb-4">
                  <Dialog.Title as="h2" className="text-2xl font-bold">
                    Transfer Details
                  </Dialog.Title>
                  <div className="flex gap-2 mr-5">
                    {data && (
                      <PDFDownloadLink
                        document={<TransferDeliveryOrderPDF data={data} items={localItems} />}
                        fileName={`DeliveryOrder_${data.assets_transaction_running_number}.pdf`}
                      >
                        {({ loading }) => (
                          <button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm mr-4"
                          >
                            {loading ? "Preparing PDF..." : "Download PDF"}
                          </button>
                        )}
                      </PDFDownloadLink>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <p><span className="font-semibold">From:</span> {data?.assets_from_branch_name}</p>
                      <p><span className="font-semibold">To:</span> {data?.assets_to_branch_name}</p>
                      <p><span className="font-semibold">Purpose:</span> {data?.asset_transaction_purpose_name}</p>
                      <p><span className="font-semibold">By:</span> {data?.created_by_name}</p>
                    </div>
                    <div className="text-left mr-20">
                      <p><span className="font-semibold">Date:</span> {new Date(data?.created_at).toLocaleDateString()}</p>
                      <p><span className="font-semibold">Reference Number:</span> {data?.assets_transaction_running_number}</p>
                      <p><span className="font-semibold">Status:</span> {data?.assets_transaction_status}</p>
                      <div>
                        <span className="font-semibold">Shipping Option:</span>{" "}
                        {data?.assets_transaction_status === "APPROVED" ? (
                          <select
                            value={selectedShippingId}
                            onChange={(e) => setSelectedShippingId(e.target.value)}
                            className="ml-2 border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">[Select Shipping]</option>
                            {shipping.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.shipping_option_name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="ml-2">{data?.assets_shipping_option_name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ✅ Items */}
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Items:</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-2 text-center border">
                              <input
                                type="checkbox"
                                onChange={(e) => toggleSelectAll(e.target.checked)}
                                checked={
                                  selectedItems.length === localItems.length
                                }
                              />
                            </th>
                            <th className="px-4 py-2 border">Code</th>
                            <th className="px-4 py-2 border">Name</th>
                            <th className="px-4 py-2 border">Category</th>
                            <th className="px-4 py-2 border text-center">Price</th>
                            <th className="px-4 py-2 border text-center">Qty</th>
                            <th className="px-4 py-2 border text-center">Total</th>
                            <th className="px-4 py-2 border text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {localItems.map((item, i) => {
                            const isSelectable = canSelectItem(item);
                            const isChecked = selectedItems.includes(item.id);
                            return (
                              <tr
                                key={i}
                                className={`${
                                  !isSelectable ? "opacity-50 bg-gray-100" : ""
                                } hover:bg-gray-50`}
                              >
                                <td className="px-2 py-2 border text-center">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={!isSelectable}
                                    onChange={() => toggleItemSelection(item.id)}
                                    className={
                                      item.status === "APPROVED"
                                        ? "accent-green-500"
                                        : item.status === "REJECTED"
                                        ? "accent-red-500"
                                        : "accent-gray-400"
                                    }
                                  />
                                </td>
                                <td className="px-4 py-2 border">{item.assets.asset_running_number}</td>
                                <td className="px-4 py-2 border">{item.asset_name}</td>
                                <td className="px-4 py-2 border">{item.assets.asset_category_name}</td>
                                <td className="px-4 py-2 border text-center">{Number(item.assets.asset_sales_cost).toFixed(2)}</td>
                                <td className="px-4 py-2 border text-center">{item.asset_unit}</td>
                                <td className="px-4 py-2 border text-center">
                                  {Number(item.assets.asset_sales_cost * item.asset_unit).toFixed(2)}
                                </td>
                                <td className="px-4 py-2 border text-center">
                                  {getStatusDisplay(item.status)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p><strong>Remark:</strong> {data?.assets_transaction_remark || "-"}</p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 flex justify-end space-x-2">
                  {buttons?.secondary && (
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium ${buttons.secondary.color}`}
                      onClick={buttons.secondary.action}
                    >
                      {buttons.secondary.label}
                    </button>
                  )}
                  {buttons?.primary && (
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium ${buttons.primary.color}`}
                      onClick={handlePrimaryAction}
                    >
                      {buttons.primary.label}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
