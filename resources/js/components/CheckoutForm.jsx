import { useEffect, useState } from "react";
import ItemsTable from "./ItemsTable";
import { useAssetMeta } from "../context/AssetsContext";
import { useAuth } from "../context/AuthContext";
import { useOptions } from "../context/OptionContext";
import TransactionDetail from "./TransactionDetail";
import { router } from "@inertiajs/react";
import confirmAction from '../components/ConfirmModal';
import Swal from 'sweetalert2';

export default function CheckoutForm({ setShowCheckoutForm, selectedItems }) {
    const { user, selectedBranch } = useAuth();
    const { fetchInvType, invType } = useOptions();
    const { createStockOut, branchItem, fetchBranchItem } = useAssetMeta();
    const [type, setType] = useState("sold");
    const branch = selectedBranch?.branch_id || "";
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [recipient, setRecipient] = useState('');
    const [status, setStatus] = useState('COMPLETED');
    const [remarks, setRemarks] = useState('');
    const [purposes, setPurposes] = useState();
    const [attachment, setAttachment] = useState(null);
    const [purposeLabel, setPurposeLabel] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [createdStockOut, setCreatedStockOut] = useState(null);

    // Check if discount should be shown
    const showDiscount = purposeLabel === "Cash";

    useEffect(() => {
        fetchInvType();
    }, [])

    useEffect(() => {
        fetchBranchItem(selectedBranch?.branch_id);
    }, [selectedBranch])

    useEffect(() => {
        if (purposeLabel === 'Event' || purposeLabel === 'Roadshow') {
            setStatus('IN PROGRESS');
        }
    }, [purposeLabel]);

    const [items, setItems] = useState([
        { assetId: "", name: "", quantity: 1, unit: "", price: 0, discount: 0, amount: 0, remark: "" },
    ]);


    const handleChange = (index, field, value) => {
        const updated = [...items];

        if (field === 'item') {
            const selectedAsset = branchItem.find(a => a.id === Number(value));
            updated[index].item = value;

            if (selectedAsset) {
                updated[index].price = parseFloat(selectedAsset.asset_sales_cost || 0);
                updated[index].unit = selectedAsset.asset_unit_measure || '';
            }
        } else {
            updated[index][field] =
                field === 'quantity' || field === 'price' || field === 'unit' || field === 'discount'
                    ? parseFloat(value)
                    : value;
        }

        const quantity = parseFloat(updated[index].quantity) || 0;
        const price = parseFloat(updated[index].price) || 0;
        const discount = showDiscount ? (updated[index].discount || 0) : 0;

        // Only apply discount if showDiscount is true
        if (showDiscount) {
            const discountAmount = price * (discount / 100);
            const finalPrice = price - discountAmount;
            updated[index].amount = quantity * finalPrice;
        } else {
            updated[index].amount = quantity * price;
            updated[index].discount = 0; // Reset discount if not showing
        }

        setItems(updated);
    };

    const addItem = () => {
        setItems([
            ...items,
            { name: "", quantity: 1, unit: "", price: 0, discount: 0, amount: 0 },
        ]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const updated = [...items];
            updated.splice(index, 1);
            setItems(updated);
        }
    };

    // Conditionally include discount column based on purposeLabel
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
        ...(showDiscount ? [{ key: "discount", label: "Discount (%)", type: "number" }] : []),
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
                    discount: 0,
                    amount: parseFloat(asset?.asset_sales_cost || 0),
                };
            });
            setItems(mapped);
        }
    }, [selectedItems, branchItem]);

    // Reset discount values when purposeLabel changes and showDiscount becomes false
    useEffect(() => {
        if (!showDiscount) {
            setItems(prevItems => 
                prevItems.map(item => {
                    const quantity = parseFloat(item.quantity) || 0;
                    const price = parseFloat(item.price) || 0;
                    return {
                        ...item,
                        discount: 0,
                        amount: quantity * price
                    };
                })
            );
        }
    }, [showDiscount]);

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Quantity',
                    text: `Quantity for "${assetName}" exceeds available stock.`,
                });
                return;
            }

            const confirm = await confirmAction({
                title: 'Confirm Stock Out?',
                text: 'Are you sure you want to submit this stock out request?',
                confirmButtonText: 'Yes, submit',
            });

            if (!confirm.isConfirmed) return;

            const result = await createStockOut(form);

            await Swal.fire({
                icon: 'success',
                title: 'Submitted!',
                text: 'Stock out request submitted successfully.',
                timer: 1500,
                showConfirmButton: false,
            });

            router.visit('/inv-list');
            setRecipient("");
            setItems([
                {
                    assetId: "",
                    name: "",
                    quantity: 1,
                    unit: "",
                    price: 0,
                    amount: 0,
                    remark: "",
                },
            ]);
            setRemarks("");
            setPurposes("");
            setAttachment(null);

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: 'Failed to create stock out.',
            });
        }
    };

    return (

        <>
            <div className="overflow-x-auto bg-white shadow rounded-lg p-4 space-y-4">
                <h1 className="text-2xl font-bold mb-6 text-center">Invoice</h1>
                <div className="flex justify-center items-center">

                    <form className="rounded-lg p-4 space-y-6" onSubmit={handleSubmit}>

                        {/* Form Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-medium">Branch</label>
                                <input
                                    name="branch"
                                    readOnly
                                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                                    value={selectedBranch?.branch_name || ''}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Invoice Date</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                                    value={date.split('-').reverse().join('/')}
                                    readOnly
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
                            {["New SA", "Insurance", "CSI", "Cash", "CASH"].includes(purposeLabel) && (
                                <div className="mb-4">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
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
                            <p className="text-sm text-gray-500 italic">file only support: pdf,xls,xlsx,doc,docx</p>
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
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mr-2"
                            >
                                Submit
                            </button>
                        </div>

                    </form>
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