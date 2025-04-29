import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function TransferDetailModal({ isOpen, onClose, data, buttons }) {
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
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
                    <ul className="list-disc pl-5">
                      {data?.assets_transaction_item_list?.map((item, index) => (
                        <li key={index}>
                          Asset ID: {item.asset_id} - Quantity: {item.asset_unit}
                        </li>
                      ))}
                    </ul>
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

                  {buttons?.primary && (
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