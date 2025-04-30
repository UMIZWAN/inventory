import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useAssetMeta } from "../context/AssetsContext";
import { useAuth } from "../context/AuthContext";

export default function TransferDetailModal({ isOpen, onClose, data, buttons, mode }) {
  const { getCategoryById, allAssets } = useAssetMeta();
  const { user } = useAuth();

  // Get asset details for each item in the transfer
  const getItemDetails = (item) => {
    const asset = allAssets.find(a => a.id === item.asset_id);
    return {
      name: asset?.name || 'Unknown Asset',
      price: asset?.asset_sales_cost || 0,
      category: asset?.asset_category_name || 'Unknown',
      ...item
    };
  };

  // Only show receive button if:
  // 1. We're in incoming mode (to branch is user's branch)
  // 2. The transfer status is IN-TRANSFER
  const shouldShowReceiveButton = mode === 'incoming' && 
                                data?.assets_transaction_status === 'IN-TRANSFER' &&
                                data?.assets_to_branch_id === user?.branch_id;

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Transfer Details
                </Dialog.Title>

                <div className="mt-4 space-y-2">
                  <p><span className="font-semibold">Running Number:</span> {data?.assets_transaction_running_number}</p>
                  <p><span className="font-semibold">Status:</span> {data?.assets_transaction_status}</p>
                  <p><span className="font-semibold">From:</span> {data?.assets_from_branch_name}</p>
                  <p><span className="font-semibold">To:</span> {data?.assets_to_branch_name}</p>
                  <p><span className="font-semibold">Created At:</span> {new Date(data?.created_at).toLocaleString()}</p>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold">Items:</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full mt-2 border">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Category</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.assets_transaction_item_list?.map((item, index) => {
                            const details = getItemDetails(item);
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">{details.name}</td>
                                <td className="px-4 py-2 border">{details.category}</td>
                                <td className="px-4 py-2 border">{Number(details.price).toFixed(2)}</td>
                                <td className="px-4 py-2 border">{details.asset_unit}</td>
                                <td className="px-4 py-2 border">{(details.price * details.asset_unit).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>

                  {shouldShowReceiveButton && buttons?.primary && (
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white ${buttons.primary.color} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
                      onClick={buttons.primary.action}
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