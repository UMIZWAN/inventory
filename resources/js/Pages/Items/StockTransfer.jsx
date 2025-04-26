import { useState } from "react";
import Layout from "../../components/layout/Layout";
import TransferList from "../../components/TransferList";
import TransferListPage from "../../components/TransferListPage";

const tabs = [
  { key: "list", label: "Transfer List" },
  { key: "receive", label: "To Receive" },
];

function StockTransfer() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <Layout>
      <div className="p-4">
        <div className="flex border-b mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 font-medium ${
                activeTab === tab.key
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "list" && <TransferList />}
        {activeTab === "receive" && <TransferListPage />}
      </div>
    </Layout>
  );
}

export default StockTransfer;