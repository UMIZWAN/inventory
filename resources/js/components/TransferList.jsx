import { useState, useEffect } from "react";
import api from "../api/api";
import { Dialog } from "@headlessui/react";

export default function TransferListTab() {
    const [requests, setRequests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        api.get("/api/assets-transaction")
            .then((res) => {
                if (res.data.success) setRequests(res.data.data);
            })
            .catch((err) => console.error("Fetch error:", err));
    }, []);

    const openModal = (txn) => {
        setSelected({ ...txn });
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelected(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelected((prev) => ({ ...prev, [name]: value }));
    };

    const handleAction = (status) => {
        axios.put(`/api/assets-transaction/${selected.id}`, {
            ...selected,
            assets_transaction_status: status,
        }).then(() => {
            closeModal();
            // Optionally refresh table
        }).catch((err) => {
            console.error("Update failed:", err);
        });
    };

    return (
        <>
            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full text-sm text-left border border-gray-200">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-2 border">Running No</th>
                            <th className="px-4 py-2 border">Purpose</th>
                            <th className="px-4 py-2 border">Status</th>
                            <th className="px-4 py-2 border">Approved By</th>
                            <th className="px-4 py-2 border">Approved At</th>
                            <th className="px-4 py-2 border">Items</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-800">
                        {requests.map((txn) => (
                            <tr key={txn.id} >
                                <td className="px-4 py-2 border hover:underline font-medium" onClick={() => openModal(txn)} >{txn.assets_transaction_running_number}</td>
                                <td className="px-4 py-2 border">{txn.assets_transaction_purpose}</td>
                                <td className="px-4 py-2 border">{txn.assets_transaction_status}</td>
                                <td className="px-4 py-2 border">{txn.approved_by_name}</td>
                                <td className="px-4 py-2 border">{txn.approved_at}</td>
                                <td className="px-4 py-2 border">
                                    <ul className="list-disc ml-5">
                                        {txn.assets_transaction_item_list.map((item) => (
                                            <li key={item.id}>
                                                {item.asset_name} ({item.asset_running_number}) - {item.asset_branch_name}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-xl space-y-6">
                        <Dialog.Title className="text-2xl font-bold text-gray-800">Transaction Details</Dialog.Title>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                                <input
                                    type="text"
                                    name="assets_transaction_type"
                                    value={selected?.assets_transaction_type || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="assets_transaction_status"
                                    value={selected?.assets_transaction_status || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Items</h4>
                            <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
                                {selected?.assets_transaction_item_list.map((item) => (
                                    <li key={item.id}>
                                        {item.asset_name} ({item.asset_running_number}) – {item.asset_branch_name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => handleAction("APPROVED")}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleAction("REJECTED")}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleAction("CANCELLED")}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={closeModal}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </>
    );
}
