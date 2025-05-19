import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useAssetMeta } from "../context/AssetsContext";
import { useAuth } from "../context/AuthContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import TransferDeliveryOrderPDF from "./TransferDeliveryOrderPDF";
import { useOptions } from "../context/OptionContext";

export default function TransferDetailModal({ isOpen, onClose, data, buttons, mode }) {
  const { getCategoryById, assets } = useAssetMeta();
  const { user } = useAuth();
  const { shipping, fetchShipping } = useOptions();
  const [selectedShippingId, setSelectedShippingId] = useState(data?.assets_shipping_option_id || '');

  useEffect(() => {
    setSelectedShippingId(data?.assets_shipping_option_id || '');
  }, [data]);

  useEffect(() => {
    fetchShipping();
  }, []);

  // Get asset details for each item in the transfer
  // const getItemDetails = (item) => {
  //   const asset = assets.find(a => a.id === item.asset_id);
  //   return {
  //     code: asset?.asset_running_number || 'Unknown Code',
  //     name: asset?.name || 'Unknown Asset',
  //     price: asset?.asset_sales_cost || 0,
  //     category: asset?.asset_category_name || 'Unknown',
  //     ...item
  //   };
  // };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">

          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                <button
                  type="button"
                  className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  aria-label="Close"
                  onClick={onClose}
                >
                  &times;
                </button>

                <div className="flex justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Transfer Details
                  </Dialog.Title>

                  <div className="flex gap-2 mr-5">
                    {data && (
                      <PDFDownloadLink
                        document={
                          <TransferDeliveryOrderPDF
                            data={data}
                            items={data.assets_transaction_item_list}
                          />
                        }
                        fileName={`DeliveryOrder_${data.assets_transaction_running_number}.pdf`}
                      >
                        {({ loading }) => (
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          >
                            {loading ? "Preparing PDF..." : "Download"}
                          </button>
                        )}
                      </PDFDownloadLink>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p><span className="font-semibold">Reference Number:</span> {data?.assets_transaction_running_number}</p>
                  <p><span className="font-semibold">Date:</span> {new Date(data?.created_at).toLocaleDateString()}</p>
                  <p><span className="font-semibold">Status:</span> {data?.assets_transaction_status}</p>
                  <p><span className="font-semibold">From:</span> {data?.assets_from_branch_name}</p>
                  <p><span className="font-semibold">To:</span> {data?.assets_to_branch_name}</p>
                  <div>
                    <span className="font-semibold">Shipping Option:</span>{' '}
                    {data?.assets_transaction_status === "APPROVED" ? (
                      <select
                        value={selectedShippingId}
                        onChange={(e) => setSelectedShippingId(e.target.value)}
                        className="ml-2 border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="">[Select Shipping]</option>
                        {shipping.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.shipping_option_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="ml-2">{data?.assets_shipping_option_name}</span>
                    )}
                  </div>


                  <div className="mt-4">
                    <h4 className="font-semibold">Items:</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full mt-2 border">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Code</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Category</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Total Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.assets_transaction_item_list?.map((item, index) => {
                            // const details = getItemDetails(item);
                            // const total = details.price * details.asset_unit;
                            // totalAmount += total;
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">{item.assets.asset_running_number}</td>
                                <td className="px-4 py-2 border">{item.asset_name}</td>
                                <td className="px-4 py-2 border">{item.assets.asset_category_name}</td>
                                <td className="px-4 py-2 border">{Number(item.assets.asset_sales_cost).toFixed(2)}</td>
                                <td className="px-4 py-2 border">{item.asset_unit}</td>
                                <td className="px-4 py-2 border">{Number(item.assets.asset_sales_cost * item.asset_unit).toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">

                  {buttons?.secondary && (
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium ${buttons.secondary.color} focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`}
                      onClick={buttons.secondary.action}
                    >
                      {buttons.secondary.label}
                    </button>
                  )}

                  {buttons?.primary && (
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium ${buttons.primary.color} focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2`}
                      onClick={() => {
                        if (buttons.primary.label === "Send") {
                          if (!selectedShippingId) {
                            alert("Please select a shipping option before sending.");
                            return;
                          }
                          buttons.primary.action(selectedShippingId);
                        } else {
                          buttons.primary.action();
                        }
                      }}

                    >
                      {buttons.primary.label}
                    </button>
                  )}

                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}