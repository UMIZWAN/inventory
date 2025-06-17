import { useEffect, useState } from "react";
import ItemsTable from "./ItemsTable";
import { useAssetMeta } from "../context/AssetsContext";
import { useAuth } from "../context/AuthContext";
import { useOptions } from "../context/OptionContext";
import TransactionDetail from "./TransactionDetail";
import { router } from "@inertiajs/react";

export default function CheckoutForm({ setShowCheckoutForm, selectedItems }) {
    const { user } = useAuth();
    const { fetchInvType, invType } = useOptions();
    const { assets, createStockOut, fetchBranchAssets, branchItem, fetchBranchItem } = useAssetMeta();
    const [type, setType] = useState("sold");
    const [branch, setBranch] = useState(user?.branch_id || "");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [recipient, setRecipient] = useState('');
    const [status, setStatus] = useState('IN PROGRESS');
    const [remarks, setRemarks] = useState('');
    const [purposes, setPurposes] = useState();
    const [attachment, setAttachment] = useState(null);
    const [purposeLabel, setPurposeLabel] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [createdStockOut, setCreatedStockOut] = useState(null);

    useEffect(() => {
        fetchInvType();
        // fetchBranchAssets();
        fetchBranchItem(user?.branch_id);
    }, [])

    const [items, setItems] = useState([
        { assetId: "", name: "", quantity: 1, unit: "", price: 0, amount: 0, remark: "" },
    ]);


    const handleChange = (index, field, value) => {
        const updated = [...items];

        if (field === 'item') {
            const selectedAsset = branchItem.find(a => a.id === Number(value)); // Fix here
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
            options: branchItem.map((a) => ({
                value: a.id, label: a.name,
                qty: a.branch_values[0]?.asset_current_unit
            })),
            width: "w-80",
        },
        { key: "quantity", label: "Qty", type: "number", placeholder: "1" },
        { key: "unit", label: "Unit", type: "readonly" },
        { key: "price", label: "Price", type: "readonly" },
        { key: "amount", label: "Total Price", type: "readonly" },
    ];

    useEffect(() => {
        if (selectedItems?.length) {
            const mapped = selectedItems.map(id => {
                const asset = branchItem.find(a => a.id === id);
                return {
                    item: asset?.id || "",
                    name: asset?.name || "",
                    quantity: 1,
                    unit: asset?.asset_unit_measure || "",
                    price: parseFloat(asset?.asset_sales_cost || 0),
                    amount: parseFloat(asset?.asset_sales_cost || 0),
                };
            });
            setItems(mapped);
        }
    }, [selectedItems, branchItem]);

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    const handleSubmit = async () => {

        try {
            const form = {
                branch,
                date,
                status,
                recipient,
                remarks,
                type,
                purposes,
                items,
                attachment,
                totalAmount,
            };

            const invalidItem = form.items.find(({ item, quantity }) => {
                const asset = branchItem.find(a => a.id === Number(item));
                if (!asset) return false;

                const currentBranchStock = asset.branch_values[0].asset_current_unit ?? 0;

                return quantity > currentBranchStock;
            });

            if (invalidItem) {
                const assetName = branchItem.find(a => a.id === Number(invalidItem.item))?.name || "Unknown item";
                alert(`Error: Quantity for "${assetName}" exceeds available stock.`);
                return;
            }

            const result = await createStockOut(form); // Ensure it returns full stock out detail
            // setCreatedStockOut(result);
            // setShowDetailModal(true);
            router.visit('/inv-list');
            setRecipient("");
            setItems([{ assetId: "", name: "", quantity: 1, unit: "", price: 0, amount: 0, remark: "" },]);
            setRemarks("");
            setPurposes("");
            setAttachment(null);
            // setShowCheckoutForm(false);
        } catch (error) {
            console.error(error);
            alert('Failed to create stock out.');
        }
    };

    return (

        <>
            {/* <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="p-6 bg-white shadow-md rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={() => setShowCheckoutForm(false)}
                    className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    aria-label="Close"
                >
                    &times;
                </button> */}
            <div className="overflow-x-auto bg-white shadow rounded-lg p-4 space-y-4">
                <h1 className="text-2xl font-bold mb-6 text-center">Invoice</h1>
                <div className="flex justify-center items-center">

                    <div className="rounded-lg p-4 space-y-6">

                        {/* Form Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-medium">Branch</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-medium">INV</label>
                                <select
                                    value={purposes}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selected = invType.find(inv => String(inv.id) === selectedId);
                                        setPurposes(selectedId);
                                        setPurposeLabel(selected?.asset_transaction_purpose_name || '');
                                    }}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="">[Select Type]</option>
                                    {invType.map((inv) => (
                                        <option key={inv.id} value={inv.id}>
                                            {inv.asset_transaction_purpose_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {(purposeLabel === "Event" || purposeLabel === "Roadshow") && (
                                <div>
                                    <label className="block mb-1 font-medium">Status</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                                        value={status}
                                        readOnly
                                    />
                                </div>
                            )}
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

                        <div>
                            <label className="block text-sm font-medium">Remarks:</label>
                            <textarea
                                className="w-full border rounded p-2 mt-1 h-24"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Attachment (optional):</label>
                            <input
                                type="file"
                                className="mt-1 p-1 w-full text-slate-500 text-sm rounded leading-6 file:bg-blue-200 file:text-blue-700 
                                file:font-semibold file:border-none file:px-4 file:py-1 file:mr-6 file:rounded hover:file:bg-blue-100 border border-gray-300"
                                onChange={(e) => setAttachment(e.target.files[0])}
                            />
                        </div>

                        {/* Submit */}
                        <div className="text-right mt-4">
                            <button
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mr-2"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                            {/* <button
                        type="button"
                        onClick={() => setShowCheckoutForm(false)}
                        className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                    >
                        Cancel
                    </button> */}
                        </div>

                    </div>
                </div>
            </div>

            {showDetailModal && createdStockOut && (
                <TransactionDetail
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    transaction={createdStockOut.data}
                    type="transfer"

                />
            )}

        </>
    );
}
