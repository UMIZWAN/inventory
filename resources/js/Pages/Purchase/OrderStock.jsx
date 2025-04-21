import React, { useState } from 'react';
import Layout from "../../components/layout/Layout";
import ItemsTable from "../../components/ItemsTable";
import { useAssetMeta } from "../../context/AssetsContext";

function OrderStock() {
    const { assets } = useAssetMeta(); 
    const [form, setForm] = useState({
        poNumber: '',
        branch: '',
        orderDate: '',
        status: 'Pending',
        supplier: '',
        items: [{ name: '', quantity: 1, price: 0 }],
    });

    const columns = [
        {
            key: "item",
            label: "Item",
            type: "select",
            options: assets.map((a) => ({ value: a.id, label: a.name })),
        },
        { key: "quantity", label: "Quantity", type: "number", min: 1, align: "text-right" },
        { key: "price", label: "Unit Price", type: "number", min: 0, step: "0.01", align: "text-right" },
        { key: "amount", label: "Amount", align: "text-right", disabled: true }, // optionally display computed
    ];

    const addItem = () => {
        setForm({ ...form, items: [...form.items, { name: '', quantity: 1, price: 0 }] });
    };

    const removeItem = (index) => {
        const items = form.items.filter((_, i) => i !== index);
        setForm({ ...form, items });
    };

    const handleItemChange = (index, field, value) => {
        const items = [...form.items];
        items[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) : value;
        setForm({ ...form, items });
    };

    const getTotal = () => {
        return form.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        Inertia.post('/purchase/order-stock', {
            ...form,
            total: getTotal(),
        });
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">New Purchase Order</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow-md">

                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700">PO No</label>
                        <input
                            type="text"
                            value={form.poNumber}
                            onChange={(e) => setForm({ ...form, poNumber: e.target.value })}
                            className="w-full mt-1 p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">Branch</label>
                        <input
                            type="text"
                            value={form.branch}
                            onChange={(e) => setForm({ ...form, branch: e.target.value })}
                            className="w-full mt-1 p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">Supplier</label>
                        <input
                            type="text"
                            value={form.supplier}
                            onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                            className="w-full mt-1 p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">Order Date</label>
                        <input
                            type="date"
                            value={form.orderDate}
                            onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
                            className="w-full mt-1 p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-full mt-1 p-2 border rounded"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Items Table */}
                <ItemsTable
                    columns={columns.filter(col => col.key !== "amount")} // omit amount if calculated outside
                    items={form.items}
                    onChange={handleItemChange}
                    onAdd={addItem}
                    onRemove={removeItem}
                />

                {/* Submit */}
                <div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Submit Order
                    </button>
                </div>
            </form>
        </Layout>
    );
}

export default OrderStock;