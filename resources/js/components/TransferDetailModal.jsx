import { Dialog } from "@headlessui/react";

export default function TransferDetailModal({ isOpen, onClose, data, onApprove, onReject }) {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center bg-black/50">
      <Dialog.Panel className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
        <Dialog.Title className="text-2xl font-semibold mb-4 text-center">Transfer Details</Dialog.Title>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Running No</p>
            <p className="font-medium">{data.assets_transaction_running_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{data.assets_transaction_status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Approved By</p>
            <p className="font-medium">{data.approved_by || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Approved At</p>
            <p className="font-medium">{data.approved_at || '-'}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Items</p>
          <ul className="list-disc ml-6 text-gray-800">
            {data.assets_transaction_item_list?.map((item) => (
              <li key={item.id}>
                {item.asset_name} ({item.asset_running_number}) - {item.asset_branch_name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            onClick={onApprove}
          >
            Approve
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            onClick={onReject}
          >
            Reject
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
