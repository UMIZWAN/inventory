import { useState } from "react";
import ItemsTable from "../../components/ItemsTable";
import Layout from "../../components/layout/Layout";
import { useAssetMeta } from "../../context/AssetsContext";
import { useAuth } from "../../context/AuthContext";

export default function StockOutPage() {
  const { user } = useAuth();
  const { assets, createStockOut } = useAssetMeta();
  const [type, setType] = useState("sold");
  const [branch, setBranch] = useState( user?.branch_id || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [purposes, setPurposes] = useState({
    CSI: false,
    Insurance: false,
    EventsRoadshows: false,
    SpecialRQ: false,
  });

  const [items, setItems] = useState([
    { assetId: "", name: "", quantity: 1, unit: "", price: 0, amount: 0, remark: "" },
  ]);

  const handlePurposeChange = (key) => {
    setPurposes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (index, field, value) => {
    const updated = [...items];

    if (field === 'item') {
      const selectedAsset = assets.find(a => a.id === Number(value)); // Fix here
      updated[index].item = value;

      if (selectedAsset) {
        updated[index].price = parseFloat(selectedAsset.asset_sales_cost || 0);
        updated[index].unit = selectedAsset.asset_unit_measure || '';
      }
    } else {
      updated[index][field] =
        field === 'quantity' || field === 'price' || field === 'unit'
          ? parseFloat(value)
          : value;
    }

    const quantity = parseFloat(updated[index].quantity) || 0;
    const price = parseFloat(updated[index].price) || 0;
    updated[index].amount = quantity * price;

    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      { name: "", quantity: 1, unit: "", price: 0, amount: 0 },
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updated = [...items];
      updated.splice(index, 1);
      setItems(updated);
    }
  };

  const columns = [
    {
      key: "item",
      label: "Item",
      type: "select",
      options: assets.map((a) => ({ value: a.id, label: a.name })),
    },
    { key: "quantity", label: "Qty", type: "number", placeholder: "1" },
    { key: "unit", label: "Unit", type: "readonly" },
    { key: "price", label: "Price", type: "readonly" },
    { key: "amount", label: "Amount", type: "readonly" },
  ];

  const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  const handleSubmit = async () => {
    try {
      const form = {
        branch,
        date,
        reference,
        remarks,
        type,
        purpose: type === "sold" ? ["SELL"] : Object.keys(purposes).filter(key => purposes[key]),
        items,
      };

      await createStockOut(form);
      alert('Stock Out created successfully!');
      // Optionally reset form here
    } catch (error) {
      console.error(error);
      alert('Failed to create stock out.');
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Stock Out Form</h1>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <p className="font-medium mb-2">Type:</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="sold"
                  checked={type === "sold"}
                  onChange={() => setType("sold")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Sell</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="normal"
                  checked={type === "normal"}
                  onChange={() => setType("normal")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Normal Checkout</span>
              </label>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div>
              <label className="block mb-1 font-medium">Customer/Recipient Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter name"
              />
            </div> */}
            <div>
              <label className="block mb-1 font-medium">Branch</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Branch"
                value={user?.branch_name}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Invoice Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Reference Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g. INV-202504"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          {/* Purposes (for normal checkout) */}
          {type === "normal" && (
            <div>
              <label className="block mb-2 font-medium">Purpose</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(purposes).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handlePurposeChange(key)}
                      className="w-4 h-4"
                    />
                    <span className="capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Items Table */}
          <div>
            <label className="block mb-2 font-medium">Item Details</label>
            <ItemsTable
              columns={columns}
              items={items}
              onChange={handleChange}
              onAdd={addItem}
              onRemove={removeItem}
            />

            <div className="text-right mt-4">
              <span className="font-semibold text-lg">
                Total: RM {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Remarks:</label>
            <textarea
              className="w-full border rounded p-2 mt-1 h-24"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            ></textarea>
          </div>

          {/* Issued By */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Issued By</label>
            <input
              type="text"
              value={currentUser.name}
              disabled
              className="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={currentUser.email}
              disabled
              className="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div> */}

          {/* Submit */}
          <div className="text-right">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
