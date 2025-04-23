import React, { useState } from 'react';
import AddAsset from '../../components/AddAsset';
import ItemDetails from '../../components/ItemDetails';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { useAssetMeta } from '../../context/AssetsContext';
import placeholder from '../../assets/image/placeholder.png';

const Assets = () => {
    const { assets } = useAssetMeta();
    const [showModal, setShowModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    const handleView = (asset) => setSelectedAsset(asset);

    return (
        <>
            <Layout>
                <div className="p-6 max-w-9xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Assets List</h1>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            + Add Item
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                                        onChange={toggleSelectAll}
                                        checked={selectedAssets.length === assets.length && assets.length > 0}
                                    />
                                </th> */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cost
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tag
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Branch
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th> */}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {assets.map((asset) => (
                                        <tr key={asset.id} className="hover:bg-gray-50" onClick={() => handleView(asset)}>
                                            {/* <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                                            checked={selectedAssets.includes(asset.id)}
                                            onChange={() => toggleAssetSelection(asset.id)}
                                        />
                                    </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {asset.asset_running_number || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded" src={asset.image_url || placeholder} alt={asset.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                                                        <div className="text-xs text-gray-500">{asset.asset_type}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {asset.asset_category_name || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {Number(asset.asset_purchase_cost).toFixed(2) || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {Number(asset.asset_sales_cost).toFixed(2) || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {asset.asset_tag_name || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {asset.assets_branch_name || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {asset.asset_current_value}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {asset.assets_location_name || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {(() => {
                                                    const current = Number(asset.asset_current_value);
                                                    const stable = Number(asset.asset_stable_value);
                                                    let badgeClass = 'px-4.5 bg-green-100 text-green-800';
                                                    let label = 'Normal';

                                                    if (current <= 0) {
                                                        badgeClass = 'px-4.5 bg-red-600 text-white';
                                                        label = 'Critical';
                                                    } else if (current <= stable / 3) {
                                                        badgeClass = 'px-3.5 bg-red-100 text-red-800';
                                                        label = 'Very Low';
                                                    } else if (current <= (2 * stable) / 3) {
                                                        badgeClass = 'px-7 bg-yellow-100 text-yellow-800';
                                                        label = 'Low';
                                                    }


                                                    return (
                                                        <span className={`w-20 text-center inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
                                                            {label}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-900" onClick={() => handleView(asset)}>
                                                        <FiEye />
                                                    </button>
                                                    <button className="text-indigo-600 hover:text-indigo-900" onClick={() => handleEdit(asset)}>
                                                        <FiEdit2 />
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(asset.id)}>
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>


                    {showModal && (
                        <AddAsset setShowModal={setShowModal} />
                    )}


                    {selectedAsset && (
                        <ItemDetails
                            asset={selectedAsset}
                            onClose={() => setSelectedAsset(null)}
                        />
                    )}

                </div>
            </Layout>
        </>
    );
};

export default Assets;
