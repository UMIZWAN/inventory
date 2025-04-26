import React, { useState } from 'react';
import { useAssetMeta } from '../context/AssetsContext';
import placeholder from '../assets/image/placeholder.png';
import { useAuth } from '../context/AuthContext';

const ItemDetails = ({ asset, onClose }) => {
    console.log('Asset Details:', asset);
    const { user } = useAuth();
    const { updateAsset, categories, tags, branches } = useAssetMeta();
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        ...asset,
        asset_category_id: asset.asset_category_id,
        asset_tag_id: asset.asset_tag_id,
        // assets_branch_id: asset.assets_branch_id,
        // assets_location_id: asset.assets_location_id,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [toast, setToast] = useState(null);
    const logs = asset.assets_log || [];

    const handleChange = (e) => {
        const { name, value } = e.target;

        const idFields = [
            'asset_category_id',
            'asset_tag_id',
            // 'assets_branch_id',
            // 'assets_location_id'
        ];

        setForm((prev) => ({
            ...prev,
            [name]: idFields.includes(name) ? parseInt(value, 10) : value,
        }));
    };

    const handleSubmit = async () => {
        try {

            const formData = new FormData();

            // Append all required fields
            formData.append('name', form.name);
            formData.append('asset_category_id', form.asset_category_id);
            formData.append('asset_tag_id', form.asset_tag_id);
            formData.append('asset_stable_unit', form.asset_stable_unit);
            formData.append('asset_unit_measure', form.asset_unit_measure);

            // Append optional fields if they exist
            if (form.asset_description) formData.append('asset_description', form.asset_description);
            if (form.asset_type) formData.append('asset_type', form.asset_type);
            if (form.asset_purchase_cost) formData.append('asset_purchase_cost', form.asset_purchase_cost);
            if (form.asset_sales_cost) formData.append('asset_sales_cost', form.asset_sales_cost);
            if (form.assets_remark) formData.append('assets_remark', form.assets_remark);

            // Append image file if it exists
            if (form.asset_image instanceof File) {
                formData.append('asset_image', form.asset_image);
            }

            const {
                asset_category_name,
                asset_tag_name,
                assets_branch_name,
                assets_location_name,
                assets_branch_id,
                assets_location_id,
                branch_values,
                assets_remark,
                assets_log,
                created_at,
                updated_at,
                total_units,
                ...cleanData
            } = form;

            await updateAsset(asset.id, cleanData);
            setEditMode(false);
            setToast('Asset updated successfully!');
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            alert('Update failed: ' + (err.response?.data?.message || err.message));
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
                                    className="px-4 py-1.5 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setEditMode(false);
                                        setForm({ ...asset, asset_image: null });
                                        setImagePreview(null);
                                    }}
                                    className="px-4 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Edit
                            </button>
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
                    <Detail
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
                    />
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
