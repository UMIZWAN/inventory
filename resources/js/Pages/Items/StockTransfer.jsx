import { useState } from "react";
import Layout from "../../components/layout/Layout";
import TransferList from "../../components/TransferList";
import CheckoutList from "../../components/CheckoutList";
import ReceiveList from "../../components/ReceiveList";

const tabs = [
  { key: "asset_in", label: "Asset In" },
  { key: "asset_transfer", label: "Asset Transfer" },
  { key: "asset_out", label: "Asset Out" }, // placeholder
];

function StockTransfer() {
  const [activeTab, setActiveTab] = useState(tabs[0].key);

  const currentTab = tabs.find((tab) => tab.key === activeTab);

  return (
    <Layout>
      <div className="p-4">
        <div className="flex border-b mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 font-medium ${activeTab === tab.key
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
                }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "asset_in" && (
          <ReceiveList />
        )}

        {activeTab === "asset_transfer" && (
          <TransferList status={null} mode="both" />
        )}

        {activeTab === "asset_out" && (
          <CheckoutList />
        )}
      </div>
    </Layout>
  );
}

export default StockTransfer;