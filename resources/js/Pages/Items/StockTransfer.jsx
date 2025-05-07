import { use, useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import TransferList from "../../components/TransferList";
import CheckoutList from "../../components/CheckoutList";
import ReceiveList from "../../components/ReceiveList";
import { useAuth } from "../../context/AuthContext";
import { useAssetMeta } from "../../context/AssetsContext";
import { Head } from "@inertiajs/react";

function StockTransfer() {
  const { user } = useAuth();
  const { assetTransfer, fetchAssetTransaction } = useAssetMeta();

  useEffect(() => {
      if (user?.branch_id) {
        fetchAssetTransaction();
      }
    }, [user]);

  const incomingTransfersCount = assetTransfer.filter(
    (txn) =>
      txn.assets_transaction_status === "IN-TRANSIT" &&
      txn.assets_to_branch_id === user?.branch_id
  ).length;

  const tabs = [
    ...(user?.receive_transaction
      ? [{ key: "asset_in", label: "Asset In" }]
      : []),
    {
      key: "asset_transfer",
      label: (
        <>
          Asset Transfer{" "}
          {incomingTransfersCount > 0 && (
            <span className="ml-2 bg-red-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {incomingTransfersCount}
            </span>
          )}
        </>
      )
    },
    { key: "asset_out", label: "Asset Out" },
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
              className={`px-4 py-2 font-medium ${
                activeTab === tab.key
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
        {activeTab === "asset_transfer" && (
          <TransferList status={null} mode="both" />
        )}
        {activeTab === "asset_out" && <CheckoutList />}
      </div>
    </Layout>
  );
}

export default StockTransfer;
