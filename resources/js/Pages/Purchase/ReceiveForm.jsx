import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import ItemsTable from "../../components/ItemsTable";
import { useAssetMeta } from "../../context/AssetsContext";

function ReceiveForm() {

  const { assets, branches } = useAssetMeta();
  const [isUsingPO, setIsUsingPO] = useState(false);
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNo, setReferenceNo] = useState("");
  const [branch, setBranch] = useState("");
  const [items, setItems] = useState([
    {
      item: '',
      unitMeasure: '',
      recvQty: 0,
      unitCost: 0,
      stockQty: 0,
    },
  ]);

  const columns = [
    {
      key: "item",
      label: "Item",
      type: "select",
      options: assets.map((a) => ({ value: a.id, label: a.name })),
    },
    { key: "unitMeasure", label: "Unit of Measure" },
    { key: "recvQty", label: "Recv Qty", type: "number", min: 0, align: "text-right" },
    { key: "unitCost", label: "Unit Cost", type: "number", min: 0, step: "0.01", align: "text-right" },
  ];

  const handleChange = (index, field, value) => {
    const updated = [...items];
  
    if (field === 'item') {
      const selectedAsset = assets.find(a => a.id === Number(value)); // Fix here
      updated[index].item = value;
  
      if (selectedAsset) {
        updated[index].unitCost = parseFloat(selectedAsset.asset_sales_cost || 0 );
        updated[index].unitMeasure = selectedAsset.asset_unit_measure || '' ;
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
        stockQty: 0,
      },
    ]);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Receive Stock</h2>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="receive_type"
              checked={!isUsingPO}
              onChange={() => setIsUsingPO(false)}
            />
            <span>Specific Items</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="receive_type"
              checked={isUsingPO}
              onChange={() => setIsUsingPO(true)}
            />
            <span>Purchase Order</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Supplier</label>
            <select className="w-full border rounded p-2 mt-1">
              <option value="">[Select Supplier]</option>
            </select>
          </div>
          {isUsingPO && (
            <div>
              <label className="block text-sm font-medium">Order</label>
              <select className="w-full border rounded p-2 mt-1">
                <option value="">[Select Order]</option>
              </select>
            </div>
          )}
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
            <select
              className="w-full border rounded p-2 mt-1"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              <option value="">[Select Branch]</option>
              {branches.map((br) => (
                <option key={br.id} value={br.id}>{br.name}</option>
              ))}
            </select>
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


        <div>
          <label className="block text-sm font-medium">Note:</label>
          <textarea className="w-full border rounded p-2 mt-1 h-24"></textarea>
        </div>

        {/* <div className="flex items-center gap-2">
          <input type="checkbox" id="mark-fully-received" />
          <label htmlFor="mark-fully-received" className="text-sm">Mark order as fully received</label>
        </div> */}

        <div className="flex justify-end gap-3 pt-4">
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Receive</button>
        </div>
      </div>
    </Layout>
  );
}

export default ReceiveForm;