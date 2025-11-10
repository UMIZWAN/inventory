import { useState, useEffect, use } from "react";
import ItemsTable from "../../components/ItemsTable";
import { useAssetMeta } from "../../context/AssetsContext";
import { useAuth } from "../../context/AuthContext";
import { useOptions } from "../../context/OptionContext";
import { router } from "@inertiajs/react";
import confirmAction from '../../components/ConfirmModal';
import Swal from 'sweetalert2';
import Layout from "../../components/layout/Layout";

function TransferForm({ setShowTransferForm, initialData, isEditMode, transferStatus, selectedItems }) {
  const { user, selectedBranch } = useAuth();
  const { branches, fetchBranches, createTransfer, branchItem, fetchBranchItem } = useAssetMeta();
  const { fetchShipping, shipping, fetchInvType, invType } = useOptions();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    requester: user?.id || "",
    department: "",
    date: new Date().toISOString().slice(0, 10),
    status: transferStatus,
    transaction_type: "ASSET_TRANSFER",
    fromBranch: "",
    toBranch: "",
    shipping: "",
    items: [{ item: '', category: '', unitMeasure: '', quantity: 1, price: 0 }],
    remarks: "",
    purpose: "",
  });

  useEffect(() => {
    fetchShipping();
    fetchBranches();
    fetchInvType();
  }, []);

  useEffect(() => {
    if (form.status === "REQUESTED" && form.fromBranch) {
      fetchBranchItem(form.fromBranch);
    } else if (form.status === "IN-TRANSIT") {
      fetchBranchItem(selectedBranch?.branch_id);
    }
  }, [form.status, form.fromBranch, selectedBranch]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fromBranch: transferStatus === "REQUESTED" ? prev.fromBranch : selectedBranch?.branch_id || "",
      toBranch: transferStatus === "REQUESTED" ? selectedBranch?.branch_id || "" : prev.toBranch,
    }));
  }, [selectedBranch, transferStatus]);

  const itemOptions =
    branchItem.map((item) => ({
      value: item.id,
      label: item.name,
      qty: item.branch_values[0]?.asset_current_unit || "0"
    }))

  useEffect(() => {
    if (selectedItems?.length) {
      const mapped = selectedItems.map(id => {
        const asset = branchItem.find(a => a.id === id);
        return {
          item: asset?.id || "",
          name: asset?.name || "",
          quantity: 1,
          category: asset?.asset_category_name || "",
          unitMeasure: asset?.asset_unit_measure || "",
          price: parseFloat(asset?.asset_sales_cost || 0),
          amount: parseFloat(asset?.asset_sales_cost || 0), // Initialize amount
        };
      });
      setForm(prev => ({
        ...prev,
        items: mapped,
      }));
    }
  }, [selectedItems, branchItem]);

  useEffect(() => {
    if (initialData) {
      setForm({
        requester: user?.id || "",
        department: "",
        date: initialData.date || new Date().toISOString().slice(0, 10),
        status: transferStatus,
        transaction_type: "ASSET_TRANSFER",
        fromBranch: selectedBranch?.branch_id || initialData.fromBranch || "",
        toBranch: selectedBranch?.branch_id || initialData.fromBranch || "",
        items: initialData.items || [{ item: '', category: '', unitMeasure: '', quantity: 1, price: 0 }],
        remarks: initialData.remarks || "",
        purpose: initialData.purpose || [],
      });
    }
  }, [selectedBranch]);

  const columns = [
    {
      key: "item",
      label: "Item",
      type: "select",
      options: itemOptions,
      width: "w-80"
    },
    { key: "category", label: "Category", readOnly: true },
    { key: "unitMeasure", label: "Unit of Measure", readOnly: true },
    { key: "quantity", label: "Quantity", type: "number", min: 1, align: "text-right" },
    { key: "price", label: "Unit Price", type: "number", min: 0, step: "0.01", align: "text-right", readOnly: true },
    { key: "amount", label: "Total Price", type: "number", min: 0, step: "0.01", align: "text-right", readOnly: true },
  ];

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { item: '', quantity: 1, price: 0 }] });
  };

  const removeItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];

    if (field === 'item') {
      const selectedAsset = branchItem.find(a => a.id === Number(value));
      updatedItems[index].item = value;

      if (selectedAsset) {
        updatedItems[index].price = parseFloat(selectedAsset.asset_sales_cost || 0);
        updatedItems[index].category = selectedAsset.asset_category_name || '';
        updatedItems[index].unitMeasure = selectedAsset.asset_unit_measure || '';
      }
    } else {
      updatedItems[index][field] =
        field === 'quantity' || field === 'price'
          ? parseFloat(value)
          : value;
    }

    const quantity = parseFloat(updatedItems[index].quantity) || 0;
    const price = parseFloat(updatedItems[index].price) || 0;
    updatedItems[index].amount = quantity * price;

    setForm({ ...form, items: updatedItems });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const totalAmount = (form.items).reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const cost = parseFloat(item.price) || 0;
    return sum + qty * cost;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (form.status === "IN-TRANSIT") {
      const invalidItem = form.items.find(({ item, quantity }) => {
        const asset = branchItem.find(a => a.id === Number(item));
        if (!asset) return false;

        const currentBranchStock = asset.branch_values?.find(
          (bv) => bv.asset_branch_id === selectedBranch.branch_id
        )?.asset_current_unit ?? 0;

        return quantity > currentBranchStock;
      });

      if (invalidItem) {
        const assetName = branchItem.find(a => a.id === Number(invalidItem.item))?.name || "Unknown item";
        await Swal.fire({
          icon: 'error',
          title: 'Insufficient Stock',
          text: `Quantity for "${assetName}" exceeds available stock.`,
        });
        setSubmitting(false);
        return;
      }
    }

    // 👇 Dynamic title & text based on form.status
    const isTransit = form.status === 'IN-TRANSIT';
    const confirm = await confirmAction({
      title: isTransit ? 'Confirm Transfer?' : 'Confirm Request?',
      text: isTransit
        ? 'Are you sure you want to submit this asset transfer?'
        : 'Are you sure you want to submit this asset request?',
      confirmButtonText: isTransit ? 'Yes, transfer' : 'Yes, request',
    });

    if (!confirm.isConfirmed) {
      setSubmitting(false);
      return;
    }

    try {
      await createTransfer(form, totalAmount);

      await Swal.fire({
        icon: 'success',
        title: isTransit ? 'Transfer Submitted!' : 'Request Submitted!',
        text: isTransit
          ? 'The asset transfer has been submitted successfully.'
          : 'The asset request has been submitted successfully.',
        timer: 1500,
        showConfirmButton: false,
      });

      router.visit("/items/asset-transaction");
      // setShowTransferForm(false);
    } catch (error) {
      console.error("Submission failed:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Something went wrong. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"> */}
      <div className="overflow-x-auto bg-white shadow rounded-lg p-12 space-y-4">

        {/* <button
          onClick={() => setShowTransferForm(false)}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button> */}

        <h2 className="text-2xl font-semibold mb-4 text-center">
          {form.status === "REQUESTED" ? "Stock Request" : "Stock Transfer "}

        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            {form.status === "REQUESTED" ? (
              <>
                <div>
                  <label className="block font-medium mb-1">From Branch</label>
                  <select
                    name="fromBranch"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={form.fromBranch}
                    onChange={handleChange}
                    required
                  >
                    <option value="">[Select Branch]</option>
                    {branches.map((br) => (
                      <option key={br.id} value={br.id}>{br.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">To Branch</label>
                  <input
                    name="toBranch"
                    value={selectedBranch?.branch_name}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block font-medium mb-1">From Branch</label>
                  <input
                    name="fromBranch"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
                    value={selectedBranch?.branch_name}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">To Branch</label>
                  <select
                    name="toBranch"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={form.toBranch}
                    onChange={handleChange}
                    required
                  >
                    <option value="">[Select Branch]</option>
                    {branches.map((br) => (
                      <option key={br.id} value={br.id}>{br.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">{form.status === "REQUESTED" ? ("Requested By") : ("Transfered By")}</label>
              <input
                type="text"
                name="requester"
                value={user?.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
                readOnly
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Purpose</label>
              <select
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              >
                <option value="">[Select Type]</option>
                {invType.map((inv) => (
                  <option key={inv.id} value={inv.id} >{inv.asset_transaction_purpose_name}</option>
                ))}
              </select>
            </div>

            {/* <div>
              <label className="block font-medium mb-1">Status</label>
              <input
                type="text"
                name="status"
                value={form.status}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
              />
            </div> */}

          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* <div>
              <label className="block font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                // onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div> */}
            <div>
              <label className="block font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                }}
              />
            </div>

            {form.status !== "REQUESTED" && (
              <div>
                <label className="block font-medium mb-1">Shipping Option</label>
                <select
                  name="shipping"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={form.shipping}
                  onChange={handleChange}
                >
                  <option value="">[Select Shipping]</option>
                  {shipping.map((s) => (
                    <option key={s.id} value={s.id}>{s.shipping_option_name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Items Table */}
          <ItemsTable
            columns={columns}
            items={form.items}
            onChange={handleItemChange}
            onAdd={addItem}
            onRemove={removeItem}
          />

          <div className="flex justify-end-safe">
            <div>
              <label className="block text-sm font-medium">Total Amount (RM)</label>
              <input
                type="text"
                className="w-full border rounded p-2 mt-1 text-right bg-gray-100"
                value={totalAmount.toFixed(2)}
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Remarks</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              disabled={submitting}
            >
              {isEditMode ? "Update" : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => setShowTransferForm(false)}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

    </>
  );
}

export default TransferForm;