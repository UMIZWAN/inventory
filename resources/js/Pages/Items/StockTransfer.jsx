import { useState } from "react";
import Layout from "../../components/layout/Layout";
import TransferForm from "../../components/TransferForm";
import TransferList from "../../components/TransferList";

const tabs = [
  { key: "list", label: "Requests List" },
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
      </div>
    </Layout>
  );
}

export default StockTransfer;