import React, { useEffect, useState } from 'react';
import api from '../api/api';
import AddAsset from '../components/AddAsset';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = () => {
    api.get('/api/assets')
      .then(response => {
        if (response.data.success) {
          setAssets(response.data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching assets:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Assets List</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Asset
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Running No</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Tag</th>
              <th className="px-4 py-2 border">Branch</th>
              <th className="px-4 py-2 border">Location</th>
              <th className="px-4 py-2 border">Stable Quantity</th>
              <th className="px-4 py-2 border">Current Quantity</th>
              <th className="px-4 py-2 border">Remarks</th>
              <th className="px-4 py-2 border">Log</th>
              <th className="px-4 py-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{asset.id}</td>
                <td className="px-4 py-2 border">{asset.name}</td>
                <td className="px-4 py-2 border">{asset.asset_type}</td>
                <td className="px-4 py-2 border">{asset.asset_running_number}</td>
                <td className="px-4 py-2 border">{asset.asset_category_name || 'Loading...'}</td>
                <td className="px-4 py-2 border">{asset.asset_tag_name|| 'Loading...'}</td>
                <td className="px-4 py-2 border">{asset.assets_branch_name || 'Loading...'}</td>
                <td className="px-4 py-2 border">{asset.assets_location}</td>
                <td className="px-4 py-2 border">{asset.asset_stable_value}</td>
                <td className="px-4 py-2 border">{asset.asset_current_value}</td>
                <td className="px-4 py-2 border">
                  <ul className="list-disc ml-4">
                    {asset.assets_remark.map((remark, i) => (
                      <li key={i}>{remark}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-2 border">
                  <ul className="list-disc ml-4">
                    {asset.assets_log.map((log, i) => (
                      <li key={i}>{log}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-2 border">{new Date(asset.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddAsset setShowModal={setShowModal}/>
      )}
    </div>
  );
};

export default Assets;
