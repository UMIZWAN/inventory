import { useEffect, useState } from "react";
import CheckoutForm from "../../components/CheckoutForm";
import TransactionFilter from "../../components/TransactionFilter";
import { useAssetMeta } from "../../context/AssetsContext";
import { useAuth } from "../../context/AuthContext";
import ExportButton from "../../components/ExportButton";
import TransactionDetail from "../../components/TransactionDetail";
import Layout from "../../components/layout/Layout";
import { useOptions } from "../../context/OptionContext";

export default function CheckoutList() {
    const { user, selectedBranch } = useAuth();
    const { fetchInvType } = useOptions();
    const { assets, assetOut, createStockOut, fetchAssetOut } = useAssetMeta();
    const [selected, setSelected] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [filters, setFilters] = useState({
        searchTerm: '',
        fromDate: '',
        toDate: '',
        fromBranch: '',
        purpose: '',
        itemName: '',
    });

    useEffect(() => {
        const params = {
            branch_id: selectedBranch?.branch_id,
            assets_transaction_type: "ASSET OUT",
        };
        fetchAssetOut(params);

    }, [selectedBranch]);

    useEffect(() => {
        fetchInvType();
    }, []);

    const openModal = (txn) => {
        setSelected(txn);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelected(null);
    };

    const filteredList = assetOut.filter((txn) => {
        const txnDate = txn.created_at.slice(0, 10);

        const assetNames = txn.assets_transaction_item_list.map(item => {
            const asset = assets.find(a => a.id === item.asset_id);
            return asset?.name?.toLowerCase() || '';
        });

        const matchesSearch =
            !filters.searchTerm ||
            txn.assets_transaction_running_number?.toLowerCase().includes(filters.searchTerm.toLowerCase());

        const matchesItem =
            !filters.itemName ||
            assetNames.some(name => name.includes(filters.itemName.toLowerCase()));

        const matchesPurpose =
            !filters.purpose || txn.asset_transaction_purpose_name == filters.purpose;

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
        <Layout>
            {/* {showCheckoutForm && (
                <CheckoutForm
                    setShowCheckoutForm={setShowCheckoutForm}
                    onSubmit={createStockOut}
                />
            )} */}

            {/* <div className="overflow-x-auto bg-white shadow rounded-lg p-4 space-y-4">
                {user?.add_edit_transaction && (
                    <div>
                        <CheckoutForm onSubmit={createStockOut} />
                    </div>
                )}
            </div> */}
            <div className="overflow-x-auto bg-white shadow rounded-lg p-4 space-y-4 mt-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Invoice List</h1>
                    {/* {user?.add_edit_transaction && (
                        <button
                            onClick={() => setShowCheckoutForm(true)}
                            className="rounded-full bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 text-sm flex items-center gap-2"
                        >
                            + New Invoice
                        </button>
                    )} */}
                </div>

                <TransactionFilter
                    filterType="checkout"
                    onFilterChange={(f) => setFilters(f)}
                />

                {user?.download_reports && (
                    <ExportButton
                        data={filteredTransfers.flatMap((txn) =>
                            txn.assets_transaction_item_list.map((item) => ({
                                "Running No": txn.assets_transaction_running_number,
                                "Type": txn.assets_transaction_type,
                                "From Branch": txn.assets_from_branch_name,
                                "To Branch": txn.assets_to_branch_name,
                                "Item": item.asset_name || "Unknown",
                                "Quantity": item.asset_unit || 0,
                                "Unit Price": (Number(item.assets.asset_sales_cost) || 0).toFixed(2),
                                "Total Price": ((Number(item.asset_unit) || 0) * (Number(item.assets.asset_sales_cost) || 0)).toFixed(2),
                                "Purpose": (() => {
                                    const val = txn.asset_transaction_purpose_name;
                                    try {
                                        const parsed = JSON.parse(val);
                                        return Array.isArray(parsed) ? parsed.join(", ") : val;
                                    } catch {
                                        return val || "-";
                                    }
                                })(),
                                "Status": txn.assets_transaction_status,
                                "Date": new Date(txn.created_at).toLocaleDateString("en-US"),
                                "Remark": txn.assets_transaction_remark || "",
                            }))
                        )}
                        filename="AssetOut"
                        sheetName="Checkout"
                    />
                )}

                <table className="min-w-full text-sm text-left border border-gray-200">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-2 border">Reference No</th>
                            {/* <th className="px-4 py-2 border">Type</th> */}
                            <th className="px-4 py-2 border">Branch</th>
                            <th className="px-4 py-2 border">Items</th>
                            <th className="px-4 py-2 border">Purpose</th>
                            <th className="px-4 py-2 border">Date Issued</th>
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
                                    {/* <td className="px-4 py-2 border">{txn.assets_transaction_type}</td> */}
                                    <td className="px-4 py-2 border">{txn.assets_from_branch_name}</td>
                                    <td className="px-4 py-2 border">
                                        <div className="space-y-4 mt-2">
                                            {txn?.assets_transaction_item_list?.map((item, index) => {
                                                return (
                                                    <ul key={index} className="list-disc list-inside text-sm text-gray-800 mb-1">
                                                        <li>{item.asset_name} — {item.asset_unit}</li>
                                                    </ul>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 border">{txn.asset_transaction_purpose_name}</td>
                                    <td className="px-4 py-2 border">{new Date(txn.created_at).toLocaleDateString()}</td>
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
                                    No checkout records found.
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
                <TransactionDetail transaction={selected} onClose={closeModal} type="transfer" />
            )}
        </Layout>
    );
}