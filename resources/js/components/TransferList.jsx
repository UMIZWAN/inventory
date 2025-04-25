import { useState, useEffect } from "react";
import api from "../api/api";
import { Dialog } from "@headlessui/react";
import TransferForm from "./TransferForm";
import TransferDetailModal from "./TransferDetailModal";


export default function TransferList() {
    const [requests, setRequests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showTransferForm, setShowTransferForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        api.get("/api/assets-transaction")
            .then((res) => {
                if (res.data.success) setRequests(res.data.data);
            })
            .catch((err) => console.error("Fetch error:", err));
    }, []);

    const filteredTransfers = requests.filter((req) => {
        const matchesStatus =
            statusFilter === 'All' || req.assets_transaction_status === statusFilter;
        const matchesSearch =
            req.assets_transaction_running_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.assets_transaction_item_list?.some((item) =>
                item.asset_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        return matchesStatus && matchesSearch;
    });


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
            {showTransferForm && (
                <TransferForm setShowTransferForm={setShowTransferForm} />
            )}

            <div className="overflow-x-auto bg-white shadow rounded-lg p-3">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Transfer List</h1>
                    <button
                        onClick={() => setShowTransferForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        + New Request
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <input
                        type="text"
                        placeholder="Search by asset name or running number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded-lg px-4 py-2 w-full sm:w-72"
                    />

                    <div className="flex gap-2 flex-wrap mt-2 sm:mt-0">
                        {['All', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1 rounded-lg border ${statusFilter === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-800 hover:bg-gray-100'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

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
                        {filteredTransfers.map((txn) => (
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
            <TransferDetailModal
                isOpen={isOpen}
                onClose={closeModal}
                data={selected}
                onApprove={() => handleAction("APPROVED")}
                onReject={() => handleAction("REJECTED")}
            />

        </>
    );
}
