import { useState, useEffect } from "react";
import ItemsTable from "./ItemsTable";
import { useAssetMeta } from "../context/AssetsContext";
import { useAuth } from "../context/AuthContext";

function TransferForm({ setShowTransferForm, initialData, onSubmit, isEditMode }) {
  const { user } = useAuth();
  const { assets, branches } = useAssetMeta();
  const [form, setForm] = useState({
    requester: user?.id || "",
    department: "",
    date: new Date().toISOString().slice(0, 10),
    status: "DRAFT",
    transaction_type: "ASSET_TRANSFER",
    fromBranch: user?.branch_id || "",
    toBranch: "",
    items: [{ item: '', category: '', unitMeasure: '', quantity: 1, price: 0 }],
    remarks: "",
    purpose: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        requester: user?.id || "",
        department: "",
        date: initialData.date || new Date().toISOString().slice(0, 10),
        status: initialData.status || "DRAFT",
        transaction_type: "ASSET_TRANSFER",
        fromBranch: initialData.fromBranch || user?.branch_id || "",
        toBranch: initialData.toBranch || "",
        items: initialData.items || [{ item: '', category: '', unitMeasure: '', quantity: 1, price: 0 }],
        remarks: initialData.remarks || "",
        purpose: initialData.purpose || [],
      });
    }
  }, [initialData, user]);

  const purposes = ["CSI", "Insurance", "Event & Roadshow", "Special RQ"];

  const columns = [
    {
      key: "item",
      label: "Item",
      type: "select",
      options: assets.map((a) => ({ value: a.id, label: a.asset_name })),
    },
    { key: "category", label: "Category", readOnly: true },
    { key: "unitMeasure", label: "Unit of Measure", readOnly: true },
    { key: "quantity", label: "Quantity", type: "number", min: 1, align: "text-right" },
    { key: "price", label: "Unit Price", type: "number", min: 0, step: "0.01", align: "text-right", readOnly: true },
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
      const selectedAsset = assets.find(a => a.id === Number(value));
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

    setForm({ ...form, items: updatedItems });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "purpose") {
      const updatedPurpose = checked
        ? [...form.purpose, value]
        : form.purpose.filter((p) => p !== value);
      setForm({ ...form, purpose: updatedPurpose });
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(form);
      setShowTransferForm(false);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="p-6 bg-white shadow-md rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {isEditMode ? "Edit Transfer Request" : "Stock Transfer Request"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">From Branch</label>
              <input
                name="fromBranch"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={user?.branch_name}
                readOnly
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Transfer By</label>
              <input
                type="text"
                name="requester"
                value={user?.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="Draft">Draft</option>
                <option value="In-Transfer">In-Transfer</option>
                <option value="Received">Received</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">To Branch</label>
              <select
                name="toBranch"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={form.toBranch}
                onChange={handleChange}
              >
                <option value="">[Select Branch]</option>
                {branches.map((br) => (
                  <option key={br.id} value={br.id}>{br.name}</option>
                ))}
              </select>
            </div>

            {/* <div>
                <label className="block font-medium mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div> */}
          </div>

          {/* Purposes checkboxes */}
          <div>
            <label className="block font-medium mb-2">Purpose</label>
            <div className="flex flex-wrap gap-4">
              {purposes.map((purpose) => (
                <label key={purpose} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="purpose"
                    value={purpose}
                    checked={form.purpose.includes(purpose)}
                    onChange={handleChange}
                    className="form-checkbox rounded text-blue-600"
                  />
                  {purpose}
                </label>
              ))}
            </div>
          </div>

          {/* Items Table */}
          <ItemsTable
            columns={columns}
            items={form.items}
            onChange={handleItemChange}
            onAdd={addItem}
            onRemove={removeItem}
          />

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
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {isEditMode ? "Update" : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => setShowTransferForm(false)}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransferForm;