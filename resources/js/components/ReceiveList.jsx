import { useState } from "react";
import TransactionFilter from "./TransactionFilter";
import { useAssetMeta } from "../context/AssetsContext";
import { useAuth } from "../context/AuthContext";
import ExportButton from "./ExportButton";
import ReceiveForm from "./ReceiveForm";
import TransactionDetail from "./TransactionDetail";

export default function ReceiveList() {
    const { user } = useAuth();
    const { allAssets, assetIn } = useAssetMeta();
    const [selected, setSelected] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showReceiveForm, setShowReceiveForm] = useState(false);
    const [filters, setFilters] = useState({
        searchTerm: '',
        fromDate: '',
        toDate: '',
        fromBranch: '',
        itemName: '',
    });

    const openModal = (txn) => {
        setSelected(txn);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelected(null);
    };

    const filteredList = assetIn.filter((txn) => {
        const txnDate = txn.created_at.slice(0, 10);

        const assetNames = txn.assets_transaction_item_list.map(item => {
            const asset = allAssets.find(a => a.id === item.asset_id);
            return asset?.name?.toLowerCase() || '';
        });

        const matchesSearch =
            !filters.searchTerm ||
            txn.assets_transaction_running_number?.toLowerCase().includes(filters.searchTerm.toLowerCase());

        const matchesItem =
            !filters.itemName ||
            assetNames.some(name => name.includes(filters.itemName.toLowerCase()));

        const matchesPurpose =
            !filters.purpose ||
            purposeArray.some(p => p.toLowerCase().includes(filters.purpose.toLowerCase()));

        const matchesDate =
            (!filters.fromDate || txnDate >= filters.fromDate) &&
            (!filters.toDate || txnDate <= filters.toDate);

        const matchesBranch =
            !filters.fromBranch || txn.assets_from_branch_id == filters.fromBranch;

        return (
            matchesSearch &&
            matchesItem &&
            matchesPurpose &&
            matchesDate &&
            matchesBranch
        );
    });

    return (
        <>
            {showReceiveForm && (
                <ReceiveForm
                    setShowReceiveForm={setShowReceiveForm}

                />
            )}

            <div className="overflow-x-auto bg-white shadow rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Receive List</h1>
                    {user?.receive_transaction && (
                        <button
                            onClick={() => setShowReceiveForm(true)}
                            className="rounded-full bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 text-sm flex items-center gap-2"
                        >
                            + Receive Asset
                        </button>
                    )}
                </div>

                <TransactionFilter
                    filterType="receive"
                    onFilterChange={(f) => setFilters(f)}
                />

                <ExportButton
                    data={filteredList.map((txn) => ({
                        "Running No": txn.assets_transaction_running_number,
                        "Type": txn.assets_transaction_type,
                        "Branch": txn.assets_from_branch_name,
                        "Items": txn.assets_transaction_item_list
                            .map(item => {
                                const asset = allAssets.find(a => a.id === item.asset_id);
                                return `${asset?.name || 'Unknown'} (${item.asset_unit})`;
                            })
                            .join(", "),
                        "Purpose": txn.assets_transaction_purpose
                            ? JSON.parse(txn.assets_transaction_purpose).join(", ")
                            : "-",
                        "Date": new Date(txn.created_at).toLocaleDateString(),
                    }))}
                    filename="AssetOut"
                    sheetName="Checkout"
                />

                <table className="min-w-full text-sm text-left border border-gray-200">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-2 border">Running No</th>
                            <th className="px-4 py-2 border">Type</th>
                            <th className="px-4 py-2 border">Branch</th>
                            <th className="px-4 py-2 border">Items</th>
                            <th className="px-4 py-2 border">Total Cost</th>
                            <th className="px-4 py-2 border">Date Received</th>
                            <th className="px-4 py-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-800">
                        {filteredList.length > 0 ? (
                            filteredList.map((txn) => (
                                <tr key={txn.id} className="hover:bg-gray-50">
                                    <td
                                        className="px-4 py-2 border hover:underline font-medium cursor-pointer"
                                        onClick={() => openModal(txn)}
                                    >
                                        {txn.assets_transaction_running_number}
                                    </td>
                                    <td className="px-4 py-2 border">{txn.assets_transaction_type}</td>
                                    <td className="px-4 py-2 border">{txn.assets_from_branch_name}</td>
                                    <td className="px-4 py-2 border">
                                        <div className="space-y-4 mt-2">
                                            {txn?.assets_transaction_item_list?.map((item, index) => {
                                                const asset = allAssets.find(a => a.id === item.asset_id);
                                                return (
                                                    <ul key={index} className="list-disc list-inside text-sm text-gray-800 mb-1">
                                                        <li>{asset?.name || 'Unknown'} — {item.asset_unit}</li>
                                                    </ul>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 border">{txn.assets_transaction_total_cost}</td>
                                    <td className="px-4 py-2 border">{new Date(txn.received_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 border">
                                        <button
                                            onClick={() => openModal(txn)}
                                            className="bg-white shadow-sm shadow-blue-600/30 px-2 rounded text-blue-600 hover:text-blue-800"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-4 py-6 text-center text-gray-400">
                                    No receive records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isOpen && selected && (
                // <CheckoutDetail
                //     transaction={selected}
                //     onClose={closeModal}
                // />

                <TransactionDetail transaction={selected} onClose={closeModal} type="receive" />
            )}
        </>
    );
}