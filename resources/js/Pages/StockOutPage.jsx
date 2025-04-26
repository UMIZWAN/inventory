import { useState } from "react";
import ItemsTable from "../components/ItemsTable";
import Layout from "../components/layout/Layout";

export default function StockOutPage() {
  const [type, setType] = useState("sold");
  const [purposes, setPurposes] = useState({
    maintenance: false,
    loan: false,
    training: false,
    relocation: false,
  });

  const [items, setItems] = useState([
    { name: "", quantity: 1, unit: "", price: 0, amount: 0 },
  ]);

  const currentUser = {
    name: "John Doe",
    email: "john@example.com",
  };

  const handlePurposeChange = (key) => {
    setPurposes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;

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
    { key: "name", label: "Item Name", type: "text", placeholder: "Enter item" },
    { key: "quantity", label: "Qty", type: "number", placeholder: "1" },
    { key: "unit", label: "Unit", type: "text", placeholder: "pcs/kg/etc" },
    { key: "price", label: "Price", type: "number", placeholder: "0.00" },
    { key: "amount", label: "Amount", type: "readonly" },
  ];

  const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  return (
    <Layout>
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Stock Out Form</h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Type Selection */}
        <div>
          <p className="font-medium mb-2">Type:</p>
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded ${
                type === "sold"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700"
              }`}
              onClick={() => setType("sold")}
            >
              Sold
            </button>
            <button
              className={`px-4 py-2 rounded ${
                type === "normal"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700"
              }`}
              onClick={() => setType("normal")}
            >
              Normal Checkout
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Customer/Recipient Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contact Number</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter contact number"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Invoice Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Reference Number</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. INV-202504"
            />
          </div>
        </div>

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
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Submit
          </button>
        </div>
      </div>
    </div>
    </Layout>
  );
}
