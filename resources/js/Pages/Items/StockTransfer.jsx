import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import TransferList from "../../components/TransferList";
import CheckoutForm from "../../components/CheckoutForm";
import ReceiveList from "../../components/ReceiveList";
import TransferForm from "./TransferForm";
import { useAuth } from "../../context/AuthContext";
import { useAssetMeta } from "../../context/AssetsContext";
import { Head } from "@inertiajs/react";

function StockTransfer() {
  const { user, selectedBranch } = useAuth();
  const { assetTransfer, fetchAssetTransfer, fetchBranchAssets } = useAssetMeta();

  useEffect(() => {
    const params = {
            branch_id: selectedBranch?.branch_id,
            assets_transaction_type: "ASSET TRANSFER",
        };
    fetchAssetTransfer(params);
    // fetchBranchAssets();
  }, [selectedBranch]);

  const incomingTransfersCount = assetTransfer.filter(
    (txn) =>
      txn.assets_transaction_status === "IN-TRANSIT" &&
      txn.assets_to_branch_id === selectedBranch?.branch_id
  ).length;

  const tabs = [
    ...(user?.receive_transaction
      ? [{ key: "asset_in", label: "Marketing In" }]
      : []),
    {
      key: "asset_transfer_list",
      label: (
        <>
          Transfer List{" "}
          {incomingTransfersCount > 0 && (
            <span className="ml-2 bg-red-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {incomingTransfersCount}
            </span>
          )}
        </>
      )
    },
    ...(user?.add_edit_transaction
    ? [{ key: "asset_request", label: "Request" }] : []),
    ...(user?.add_edit_transaction
    ? [{ key: "asset_transfer", label: "Transfer" }] : []),
    { key: "asset_out", label: "Invoice" },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].key);

  return (
    <Layout>
      <Head title="Transaction" />
      <div className="p-4">
        <div className="flex border-b border-gray-400 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 font-medium ${activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-400 hover:text-sky-600"
                }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "asset_in" && <ReceiveList />}
        {activeTab === "asset_transfer_list" && (
          <TransferList status={null} mode="both" />
        )}
        {activeTab === "asset_request" && (
          <TransferForm mode="both"
            transferStatus={"REQUESTED"}
          />
        )}
        {activeTab === "asset_transfer" && (
          <TransferForm mode="both"
            transferStatus={"IN-TRANSIT"}
          />
        )}
        {activeTab === "asset_out" && <CheckoutForm />}
      </div>
    </Layout>
  );
}

export default StockTransfer;
