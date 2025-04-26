import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
// import TransferDetailsModal from "./TransferDetailsModal";

function TransferListPage() {
    const { user } = useAuth();
    const [transfers, setTransfers] = useState([]);
    const [selectedTransfer, setSelectedTransfer] = useState(null);

    useEffect(() => {
        // Replace with your API call
        const mockTransfers = [
            {
                id: 1, requester: "Alice", date: "2025-04-24", fromBranch: "HQ", toBranch: "Branch A", status: "Pending", items: [
                    {
                        item: 1,
                        name: "Printer",
                        category: "Electronics",
                        unitMeasure: "Unit",
                        quantity: 2,
                        price: 300
                    },

                ]
            },
            { id: 2, requester: "Bob", date: "2025-04-23", fromBranch: "HQ", toBranch: "Branch B", status: "Received" },
        ];
        setTransfers(mockTransfers);
    }, []);

    const handleMarkReceived = (id) => {
        setTransfers((prev) =>
            prev.map((t) =>
                t.id === id ? { ...t, status: "Received" } : t
            )
        );
        setSelectedTransfer(null);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Asset Transfers</h1>
            <table className="min-w-full border border-gray-300 text-left">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 border">Requester</th>
                        <th className="px-4 py-2 border">Date</th>
                        <th className="px-4 py-2 border">From</th>
                        <th className="px-4 py-2 border">To</th>
                        <th className="px-4 py-2 border">Status</th>
                        <th className="px-4 py-2 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {transfers.map((t) => (
                        <tr key={t.id}>
                            <td className="px-4 py-2 border">{t.requester}</td>
                            <td className="px-4 py-2 border">{t.date}</td>
                            <td className="px-4 py-2 border">{t.fromBranch}</td>
                            <td className="px-4 py-2 border">{t.toBranch}</td>
                            <td className="px-4 py-2 border">{t.status}</td>
                            <td className="px-4 py-2 border">
                                <button
                                    onClick={() => setSelectedTransfer(t)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedTransfer && (
                <TransferDetailsModal
                    transfer={selectedTransfer}
                    currentUser={user}
                    onClose={() => setSelectedTransfer(null)}
                    onMarkReceived={handleMarkReceived}
                />
            )}
        </div>
    );
}

export default TransferListPage;


function TransferDetailsModal({ transfer, onClose, onMarkReceived, currentUser }) {
    const [checkedItems, setCheckedItems] = useState(
        transfer.items?.map(() => false) || []
    );
    const [receivedDate, setReceivedDate] = useState(null);

    useEffect(() => {
        if (transfer.status === "Received") {
            setReceivedDate(new Date().toLocaleDateString());
        }
    }, [transfer.status]);

    const handleItemCheck = (index) => {
        const updatedChecks = [...checkedItems];
        updatedChecks[index] = !updatedChecks[index];
        setCheckedItems(updatedChecks);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl">
                <h2 className="text-xl font-semibold mb-4 text-center">Transfer Details</h2>

                {/* Transfer Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><strong>Requester:</strong> {transfer.requester}</div>
                    <div><strong>Date:</strong> {transfer.date}</div>
                    <div><strong>From Branch:</strong> {transfer.fromBranch}</div>
                    <div><strong>To Branch:</strong> {transfer.toBranch}</div>
                    <div><strong>Status:</strong> {transfer.status}</div>
                </div>

                {/* Items Section */}
                <h3 className="text-lg font-semibold mt-6 mb-2">Items</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-3 py-2 border text-left">✓</th>
                                <th className="px-3 py-2 border text-left">Name</th>
                                <th className="px-3 py-2 border text-left">Category</th>
                                <th className="px-3 py-2 border text-left">Unit</th>
                                <th className="px-3 py-2 border text-right">Qty</th>
                                <th className="px-3 py-2 border text-right">Unit Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfer.items?.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 border">
                                        <input
                                            type="checkbox"
                                            checked={checkedItems[index]}
                                            onChange={() => handleItemCheck(index)}
                                        />
                                    </td>
                                    <td className="px-3 py-2 border">{item.name}</td>
                                    <td className="px-3 py-2 border">{item.category}</td>
                                    <td className="px-3 py-2 border">{item.unitMeasure}</td>
                                    <td className="px-3 py-2 border text-right">{item.quantity}</td>
                                    <td className="px-3 py-2 border text-right">RM {item.price?.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Receiver Info & Date Received */}
                {transfer.status === "Received" && (
                    <div className="mt-6 border-t pt-4">
                        <h3 className="text-lg font-semibold">Receiver Information</h3>
                        <div><strong>Receiver Name:</strong> {currentUser?.name || "N/A"}</div>
                        <div><strong>Date Received:</strong> {receivedDate}</div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                    {transfer.status !== "Received" && (
                        <button
                            onClick={() => onMarkReceived(transfer.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Mark as Received
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

//   export default TransferDetailsModal;
