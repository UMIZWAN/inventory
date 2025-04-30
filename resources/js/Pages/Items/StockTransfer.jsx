import { useState } from "react";
import Layout from "../../components/layout/Layout";
import TransferList from "../../components/TransferList";

const tabs = [
  // { key: "draft", label: "Draft", status: "DRAFT" },
  { key: "in_transfer", label: "In Transfer", status: "IN-TRANSFER" },
  { key: "received", label: "Received", status: "RECEIVED" },
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

        {currentTab && <TransferList status={currentTab.status} />}
      </div>
    </Layout>
  );
}

export default StockTransfer;
