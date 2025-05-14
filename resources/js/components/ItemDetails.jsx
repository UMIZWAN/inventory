import React, { useState } from 'react';
import { FaEdit, FaSave } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { useAssetMeta } from '../context/AssetsContext';
import placeholder from '../assets/image/placeholder.png';
import { useAuth } from '../context/AuthContext';

const ItemDetails = ({ asset, onClose }) => {
    const { user } = useAuth();
    const { updateAsset, categories, tags, branches } = useAssetMeta();
    const [editMode, setEditMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: asset.name || '',
        asset_category_id: asset.asset_category_id || '',
        asset_stable_unit: asset.asset_stable_unit || '',
        asset_unit_measure: asset.asset_unit_measure || '',
        asset_description: asset.asset_description || '',
        asset_type: asset.asset_type || '',
        asset_purchase_cost: asset.asset_purchase_cost || '',
        asset_sales_cost: asset.asset_sales_cost || '',
        assets_remark: asset.assets_remark || '',
        asset_running_number: asset.asset_running_number || '',
        asset_image: asset.asset_image || null,
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [toast, setToast] = useState(null);
    const logs = asset.assets_log || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        try {
            // Create a clean payload with all required fields
            const payload = {
                name: form.name,
                asset_category_id: form.asset_category_id,
                asset_stable_unit: form.asset_stable_unit,
                asset_unit_measure: form.asset_unit_measure,
                asset_description: form.asset_description || null,
                asset_type: form.asset_type || null,
                asset_purchase_cost: form.asset_purchase_cost || null,
                asset_sales_cost: form.asset_sales_cost || null,
                assets_remark: form.assets_remark || null,
                asset_running_number: form.asset_running_number || null,
            };

            // If there's a new image file, use FormData
            if (form.asset_image instanceof File) {
                const formData = new FormData();
                Object.entries(payload).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                formData.append('asset_image', form.asset_image);

                await updateAsset(asset.id, formData);
            } else {
                // Otherwise, send as regular JSON
                await updateAsset(asset.id, payload);
            }

            setEditMode(false);
            setToast('Asset updated successfully!');
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            alert('Update failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false); // <-- End submitting
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setForm({ ...form, asset_image: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const isEditing = (field) =>
        editMode ? (
            <input
                name={field}
                value={form[field] ?? ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
        ) : (
            <span>{asset[field] ?? '—'}</span>
        );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/60">
            {toast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm px-4 py-2 rounded shadow">
                    {toast}
                </div>
            )}

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    aria-label="Close"
                >
                    &times;
                </button>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {editMode ? 'Edit Asset' : 'Asset Details'}
                    </h2>
                    <div className="space-x-2">
                        {editMode ? (
                            <>
                                <button
                                    onClick={handleSubmit}
                                    className="bg-white shadow-sm shadow-green-600/30 px-4 py-1 rounded-xs text-green-600 hover:text-green-800 hover:bg-green-100 focus:outline-2"
                                    disabled={submitting}
                                >
                                    <FaSave className="inline-block mr-1 mb-1" />
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setEditMode(false);
                                        setForm({ ...asset, asset_image: null });
                                        setImagePreview(null);
                                    }}
                                    className="bg-white shadow-sm shadow-gray-600/30 px-3 py-1 rounded-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-2 mr-6"
                                    disabled={submitting}
                                >
                                    <MdOutlineCancel className="inline-block mr-1 mb-1" />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            user?.add_edit_asset && (
                                <>
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="bg-white shadow-sm shadow-blue-600/30 px-2 py-1 rounded-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 focus:outline-2 mr-2"
                                    >
                                        <FaEdit className="inline-block mr-1 mb-1" />
                                        Edit
                                    </button>
                                </>
                            )
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0 relative">
                        <img
                            src={imagePreview || `http://127.0.0.1:8000/${form.asset_image}` || placeholder}
                            alt={form.name}
                            className="w-40 h-40 object-cover rounded-xl border border-gray-200"
                        />
                        {editMode && (
                            <input
                                type="file"
                                name="asset_image"
                                onChange={handleFileChange}
                                className="mt-2 w-40 text-sm px-2 py-1 border rounded"
                            />
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div>
                            <label className="text-sm font-semibold text-gray-600">Name:</label>
                            {isEditing('name')}
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-600">Type:</label>
                            {isEditing('asset_type')}
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-600">Description:</label>
                            {isEditing('asset_description')}
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
                    <Detail label="Code" value={isEditing('asset_running_number')} />
                    <Detail
                        label="Category"
                        value={editMode ? (
                            <select
                                name="asset_category_id"
                                value={form.asset_category_id ?? ''}
                                onChange={handleChange}
                                className="w-full border rounded px-2 py-1 text-sm"
                            >
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        ) : (
                            <span>{asset.asset_category_name ?? '—'}</span>
                        )}
                    />
                    {/* <Detail
                        label="Tag"
                        value={editMode ? (
                            <select
                                name="asset_tag_id"
                                value={form.asset_tag_id ?? ''}
                                onChange={handleChange}
                                className="w-full border rounded px-2 py-1 text-sm"
                            >
                                {tags.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        ) : (
                            <span>{asset.asset_tag_name ?? '—'}</span>
                        )}
                    /> */}
                    <Detail label="Unit" value={isEditing('asset_unit_measure')} />
                    <Detail label="Cost" value={isEditing('asset_purchase_cost')} />
                    <Detail label="Price" value={isEditing('asset_sales_cost')} />
                    <Detail label="Stable Quantity" value={isEditing('asset_stable_unit')} />
                    {!editMode && (
                        <>
                            <Detail label="Current Quantity" value={asset.branch_values?.find(bv => bv.asset_branch_id === user?.branch_id)?.asset_current_unit ?? '—'} />
                            <Detail
                                label="Branch"
                                value={asset.branch_values?.find(bv => bv.asset_branch_id === user?.branch_id)?.asset_branch_name ?? '—'}
                            />
                            <Detail
                                label="Location"
                                value={asset.branch_values?.find(bv => bv.asset_branch_id === user?.branch_id)?.asset_location_name ?? '—'}
                            />
                        </>
                    )}
                </div>

                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Remarks:</h3>
                    {editMode ? (
                        <textarea
                            name="assets_remark"
                            value={form.assets_remark ?? ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            rows={3}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{asset.assets_remark ?? '—'}</p>
                    )}
                </div>

                {Array.isArray(logs) && logs.length > 0 && !editMode && (
                    <Section title="Logs" items={logs} />
                )}
            </div>
        </div>
    );
};

const Detail = ({ label, value }) => (
    <div>
        <span className="text-gray-600 font-medium">{label}:</span>
        <div className="text-gray-800 mt-1">{value}</div>
    </div>
);

const Section = ({ title, items }) => (
    <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {items.map((item, idx) => (
                <li key={idx}>{item}</li>
            ))}
        </ul>
    </div>
);

export default ItemDetails;
