import { useState } from "react";
import Layout from "./layout/Layout";
import ItemsTable from "./ItemsTable";
import { useAssetMeta } from "../context/AssetsContext";

function TransferForm({ setShowTransferForm }) {
  const { assets, branches } = useAssetMeta();
  const [form, setForm] = useState({
    requester: "",
    department: "",
    date: "",
    status: "Pending",
    fromBranch: "",
    toBranch: "",
    items: [{ name: '', unitMeasure: '', quantity: 1, price: 0 }],
    remarks: "",
    purpose: [],
  });

  const purposes = ["CSI", "Insurance", "Event & Roadshow", "Special RQ"];

  const columns = [
    {
      key: "item",
      label: "Item",
      type: "select",
      options: assets.map((a) => ({ value: a.id, label: a.name })),
    },
    { key: "unitMeasure", label: "Unit of Measure" },
    { key: "quantity", label: "Quantity", type: "number", min: 1, align: "text-right" },
    { key: "price", label: "Unit Price", type: "number", min: 0, step: "0.01", align: "text-right" },
  ];

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { name: '', quantity: 1, price: 0 }] });
  };

  const removeItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...form.items];

    if (field === 'item') {
      const selectedAsset = assets.find(a => a.id === Number(value)); // Fix here
      updated[index].item = value;

      if (selectedAsset) {
        updated[index].price = parseFloat(selectedAsset.asset_sales_cost || 0);
        updated[index].unitMeasure = selectedAsset.asset_unit_measure || '';
      }
    } else {
      updated[index][field] =
        field === 'quantity' || field === 'price' || field === 'unitMeasure'
          ? parseFloat(value)
          : value;
    }

    setForm({ ...form, updated });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "purpose") {
      const updatedPurpose = checked
        ? [...form.purpose, value]
        : form.purpose.filter((p) => p !== value);
      setForm({ ...form, purpose: updatedPurpose });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Stock Transfer Request Submitted:", form);
    // TODO: send to API
  };

  return (

    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="p-6 bg-white shadow-md rounded-xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">Stock Transfer Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Requested By</label>
              <input
                type="text"
                name="requester"
                value={form.requester}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
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
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">From Branch</label>
              <select
                name="fromBranch"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={form.fromBranch}
                onChange={handleChange}
              >
                <option value="">[Select Branch]</option>
                {branches.map((br) => (
                  <option key={br.id} value={br.id}>{br.name}</option>
                ))}
              </select>
            </div>

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
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Submit</button>
            <button type="button" onClick={() => setShowTransferForm(false)} className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    </div>

  );
}

export default TransferForm;
