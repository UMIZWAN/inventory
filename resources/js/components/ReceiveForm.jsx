import React, { use, useEffect, useState } from "react";
import ItemsTable from "./ItemsTable";
import { useAssetMeta } from "../context/AssetsContext";
import { useSuppliers } from "../context/SuppliersContext";
import { useAuth } from "../context/AuthContext";

function ReceiveForm({ setShowReceiveForm, selectedItems }) {
  const { user } = useAuth();
  const { createAssetIn, itemList, fetchItemList } = useAssetMeta();
  const { suppliers, fetchSuppliers } = useSuppliers();
  const [submitting, setSubmitting] = useState(false);
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNo, setReferenceNo] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [branch, setBranch] = useState(user?.branch_id || "");
  const [items, setItems] = useState([
    {
      item: '',
      unitMeasure: '',
      recvQty: 1,
      unitCost: 0,
      price: 0,
    },
  ]);

  useEffect(() => {
    fetchSuppliers();
    fetchItemList();
  }, []);

  const columns = [
    {
      key: "item",
      label: "Item",
      type: "select",
      options: itemList.map((a) => ({ value: a.id, label: a.name })),
      width: "w-80"
    },
    { key: "unitMeasure", label: "Unit of Measure", align: "text-center" },
    { key: "recvQty", label: "Recv Qty", type: "number", min: 0, align: "text-center" },
    { key: "unitCost", label: "Unit Cost", type: "number", min: 0, step: "0.01", align: "text-center" },
    { key: "price", label: "Selling Price", type: "number", min: 0, step: "0.01", align: "text-center" },
  ];

  useEffect(() => {
    if (selectedItems?.length) {
      const mapped = selectedItems.map(id => {
        const asset = itemList.find(a => a.id === id);
        return {
          item: asset?.id || "",
          name: asset?.name || "",
          recvQty: 1,
          unitMeasure: asset?.asset_unit_measure || "",
          unitCost: parseFloat(asset?.asset_sales_cost || 0),
          price: parseFloat(asset?.asset_sales_cost || 0),
        };
      });
      setItems(mapped);
    }
  }, [selectedItems, itemList]);

  const handleChange = (index, field, value) => {
    const updated = [...items];

    if (field === 'item') {
      const selectedAsset = itemList.find(a => a.id === Number(value)); // Fix here
      updated[index].item = value;

      if (selectedAsset) {
        updated[index].unitCost = parseFloat(selectedAsset.asset_purchase_cost || 0);
        updated[index].price = parseFloat(selectedAsset.asset_sales_cost || 0);
        updated[index].unitMeasure = selectedAsset.asset_unit_measure || '';
      }
    } else {
      updated[index][field] =
        field === 'recvQty' || field === 'unitCost' || field === 'unitMeasure'
          ? parseFloat(value)
          : value;
    }

    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        item: '',
        unitMeasure: '',
        recvQty: 0,
        unitCost: 0,
        price: 0,
      },
    ]);
  };

  const totalAmount = items.reduce((sum, item) => {
    const qty = parseFloat(item.recvQty) || 0;
    const cost = parseFloat(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      await createAssetIn({
        date: receiveDate,
        supplierId,
        referenceNo,
        branch,
        userId: user.id,
        note,
        items,
        totalAmount
      });
      alert("Stock received successfully.");
      setShowReceiveForm(false);
    } catch (err) {
      alert("Failed to receive stock.");
    } finally {
      setSubmitting(false); // <-- End submitting
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="p-6 bg-white shadow-md rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative">

        <button
          onClick={() => setShowReceiveForm(false)}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>

        <h1 className="text-2xl font-bold mb-6">Receive Stock</h1>

        <div className="flex items-center gap-4">
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Supplier</label>
            <select
              className="w-full border rounded p-2 mt-1"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">[Select Supplier]</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.supplier_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Reference No.</label>
            <input
              type="text"
              className="w-full border rounded p-2 mt-1"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Branch</label>
            <input
              name="branch"
              readOnly
              className="w-full border rounded p-2 mt-1"
              value={user?.branch_name}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Receive Date</label>
          <input
            type="date"
            className="border rounded p-2 mt-1"
            value={receiveDate}
            onChange={(e) => setReceiveDate(e.target.value)}
          />
        </div>

        {/* Items Table */}
        <ItemsTable
          columns={columns}
          items={items}
          onChange={handleChange}
          onAdd={addItem}
          onRemove={(index) => {
            if (items.length > 1) {
              const updated = [...items];
              updated.splice(index, 1);
              setItems(updated);
            }
          }}
        />

        <div className="flex justify-end-safe">
          <div>
            <label className="block text-sm font-medium">Total Cost (RM)</label>
            <input
              type="text"
              className="w-full border rounded p-2 mt-1 text-right bg-gray-100"
              value={totalAmount.toFixed(2)}
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Remarks:</label>
          <textarea
            className="w-full border rounded p-2 mt-1 h-24"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
            disabled={submitting}
          >
            Receive
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
            onClick={() => setShowReceiveForm(false)}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>

  );
}

export default ReceiveForm;