import React, { useEffect, useState } from 'react';
import { FaEdit, FaSave } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { useAssetMeta } from '../context/AssetsContext';
import placeholder from '../assets/image/placeholder.png';
import { useAuth } from '../context/AuthContext';
import { Link } from '@inertiajs/react';
import { LINKS } from '../constants/links';

const normalizeTags = (raw) => {
    if (raw == null || raw === '') return [];
    const items = Array.isArray(raw) ? raw : [raw];
    const out = [];
    for (const item of items) {
        if (typeof item !== 'string') { if (item != null) out.push(String(item)); continue; }
        const trimmed = item.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) { parsed.forEach(p => p && out.push(String(p))); continue; }
            } catch { /* fall through */ }
        }
        out.push(item);
    }
    return [...new Set(out.filter(Boolean))];
};

const ItemDetails = ({ asset, onClose, onUpdated, startInEdit = false, asPage = false }) => {
    const { user, selectedBranch } = useAuth();
    const { updateAsset, categories, branches, fetchBranches } = useAssetMeta();
    const [editMode, setEditMode] = useState(startInEdit);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: asset.name || '',
        asset_category_id: asset.asset_category_id || '',
        asset_tag: normalizeTags(asset.asset_tag),
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

    const PRESET_TAG_OPTIONS = ['Delivery Gift', 'Insurance Gift', 'Test Drive Gift', 'Doorgift', 'Vip Gift', 'Premium Gift', 'Event Gift', 'Booking Gift', 'Customer Visit Gift'];
    const initialNormalized = normalizeTags(asset.asset_tag);
    const initialOther = initialNormalized.find(t => !PRESET_TAG_OPTIONS.includes(t)) || '';
    const [otherChecked, setOtherChecked] = useState(!!initialOther);
    const [otherText, setOtherText] = useState(initialOther);

    const [imagePreview, setImagePreview] = useState(null);
    const [toast, setToast] = useState(null);
    const logs = asset.assets_log || [];

    useEffect(() => {
        fetchBranches();
    }, []);

    const branchQtyMap = new Map(
        (asset.branch_values || [])
            .filter(bv => bv.is_enabled !== false)
            .map(bv => [bv.asset_branch_id, bv.asset_current_unit])
    );
    // Branches newly ticked / unticked in edit mode. Unticking is only allowed
    // when the branch holds no stock (backend refuses removal otherwise).
    const [newBranchIds, setNewBranchIds] = useState(new Set());
    const [removedBranchIds, setRemovedBranchIds] = useState(new Set());

    const handleBranchToggle = (branchId) => {
        if (branchQtyMap.has(branchId)) {
            const qty = Number(branchQtyMap.get(branchId)) || 0;
            if (qty > 0) {
                alert('Cannot disable this branch: it still has stock. Transfer or clear the stock first.');
                return;
            }
            setRemovedBranchIds(prev => {
                const next = new Set(prev);
                if (next.has(branchId)) {
                    next.delete(branchId);
                } else {
                    next.add(branchId);
                }
                return next;
            });
            return;
        }
        setNewBranchIds(prev => {
            const next = new Set(prev);
            if (next.has(branchId)) {
                next.delete(branchId);
            } else {
                next.add(branchId);
            }
            return next;
        });
    };

    // Re-sync form when the asset prop changes (e.g. after save)
    useEffect(() => {
        const normalized = normalizeTags(asset.asset_tag);
        const other = normalized.find(t => !PRESET_TAG_OPTIONS.includes(t)) || '';
        setForm({
            name: asset.name || '',
            asset_category_id: asset.asset_category_id || '',
            asset_tag: normalized.filter(t => PRESET_TAG_OPTIONS.includes(t)),
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
        setOtherChecked(!!other);
        setOtherText(other);
        setImagePreview(null);
        setNewBranchIds(new Set());
        setRemovedBranchIds(new Set());
    }, [asset]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTagToggle = (tag) => {
        setForm(prev => ({
            ...prev,
            asset_tag: prev.asset_tag.includes(tag)
                ? prev.asset_tag.filter(t => t !== tag)
                : [...prev.asset_tag, tag],
        }));
    };

    const handleSubmit = async () => {

        const requiredFields = ['name', 'asset_category_id', 'asset_unit_measure', 'asset_stable_unit'];
        for (let field of requiredFields) {
            if (!form[field] || form[field].toString().trim() === '') {
                alert(`The field "${field.replace(/_/g, ' ')}" is required.`);
                return;
            }
        }

        setSubmitting(true);

        try {
            const finalTags = otherChecked && otherText.trim()
                ? [...form.asset_tag, otherText.trim()]
                : form.asset_tag;

            // Create a clean payload with all required fields
            const payload = {
                name: form.name,
                asset_category_id: form.asset_category_id,
                asset_tag: finalTags,
                asset_stable_unit: form.asset_stable_unit,
                asset_unit_measure: form.asset_unit_measure,
                asset_description: form.asset_description,
                asset_type: form.asset_type,
                asset_purchase_cost: form.asset_purchase_cost,
                asset_sales_cost: form.asset_sales_cost,
                assets_remark: form.assets_remark,
                asset_running_number: form.asset_running_number,
            };

            const newBranchValues = [...newBranchIds].map(branchId => ({
                asset_branch_id: branchId,
                asset_current_unit: 0,
            }));
            const branchRemovals = [...removedBranchIds];

            let updated;

            // If there's a new image file, use FormData
            if (form.asset_image instanceof File) {
                const formData = new FormData();
                Object.entries(payload).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach(v => formData.append(`${key}[]`, v));
                    } else {
                        formData.append(key, value ?? '');
                    }
                });
                newBranchValues.forEach((bv, i) => {
                    formData.append(`asset_branch_values[${i}][asset_branch_id]`, bv.asset_branch_id);
                    formData.append(`asset_branch_values[${i}][asset_current_unit]`, bv.asset_current_unit);
                });
                branchRemovals.forEach(id => {
                    formData.append('asset_branch_values_remove[]', id);
                });
                formData.append('asset_image', form.asset_image);

                updated = await updateAsset(asset.id, formData);
            } else {
                if (newBranchValues.length > 0) {
                    payload.asset_branch_values = newBranchValues;
                }
                if (branchRemovals.length > 0) {
                    payload.asset_branch_values_remove = branchRemovals;
                }
                updated = await updateAsset(asset.id, payload);
            }

            if (onUpdated) onUpdated(updated);

            setEditMode(false);
            setToast('Asset updated successfully!');
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            alert('Update failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false); // <-- End submitting
        }
    };

    const handleToggleActive = async () => {
        const deactivating = asset.is_active !== false;
        if (!confirm(deactivating
            ? "Deactivate this asset? It will be hidden from the Stock List but remain visible (struck through) in transaction history."
            : "Reactivate this asset? It will appear in the Stock List again.")) return;

        setSubmitting(true);
        try {
            const updated = await updateAsset(asset.id, { is_active: deactivating ? 0 : 1 });
            if (onUpdated) onUpdated(updated);
            setToast(deactivating ? 'Asset deactivated.' : 'Asset activated.');
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
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
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
        ) : (
            <span>{asset[field] ?? ''}</span>
        );

    const wrapperClass = asPage
        ? ""
        : "fixed inset-0 z-50 flex items-center justify-center bg-gray-800/60";
    const cardClass = asPage
        ? "relative border border-gray-200 bg-white rounded-2xl w-full max-w-4xl p-6 sm:p-8"
        : "relative bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto";

    return (
        <div className={wrapperClass}>
            {toast && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm px-4 py-2 rounded shadow">
                    {toast}
                </div>
            )}

            <div className={cardClass}>
                {!asPage && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                )}

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {asset.asset_running_number} - {asset.name}
                            {asset.is_active === false && (
                                <span className="ml-3 align-middle px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                    Deactivated
                                </span>
                            )}
                        </h2>
                        {editMode ? (
                            <input
                                name="asset_type"
                                value={form.asset_type ?? ''}
                                onChange={handleChange}
                                placeholder="Type/Size"
                                className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        ) : (
                            asset.asset_type && (
                                <p className="text-sm font-bold text-gray-500 mt-1">{asset.asset_type}</p>
                            )
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {editMode ? (
                            <>
                                <button
                                    onClick={handleSubmit}
                                    className="inline-flex items-center justify-center gap-1 bg-white shadow-sm shadow-green-600/30 px-3 py-0.5 rounded-full text-[11px] text-green-600 hover:text-green-800"
                                    disabled={submitting}
                                >
                                    <FaSave className="w-3 h-3" />
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setEditMode(false);
                                        setForm({ ...asset, asset_image: null });
                                        setImagePreview(null);
                                        setNewBranchIds(new Set());
                                        setRemovedBranchIds(new Set());
                                    }}
                                    className="inline-flex items-center justify-center gap-1 bg-white shadow-sm shadow-gray-600/30 px-3 py-0.5 rounded-full text-[11px] text-gray-500 hover:text-gray-800"
                                    disabled={submitting}
                                >
                                    <MdOutlineCancel className="w-3 h-3" />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            user?.add_edit_asset && (
                                <>
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="inline-flex items-center justify-center gap-1 bg-white shadow-sm shadow-amber-600/30 px-3 py-0.5 rounded-full text-[11px] text-amber-600 hover:text-amber-800"
                                    >
                                        <FaEdit className="w-3 h-3" />
                                        Edit
                                    </button>
                                    {user?.email === 'kamal@gmail.com' && (
                                        <button
                                            onClick={handleToggleActive}
                                            disabled={submitting}
                                            className={asset.is_active === false
                                                ? "inline-flex items-center justify-center gap-1 bg-white shadow-sm shadow-green-600/30 px-3 py-0.5 rounded-full text-[11px] text-green-600 hover:text-green-800"
                                                : "inline-flex items-center justify-center gap-1 bg-white shadow-sm shadow-red-600/30 px-3 py-0.5 rounded-full text-[11px] text-red-600 hover:text-red-800"}
                                        >
                                            {asset.is_active === false ? 'Activate' : 'Deactivate'}
                                        </button>
                                    )}
                                </>
                            )
                        )}
                    </div>
                </div>

                <div className="mb-6 text-center">
                    <div className="relative w-40 h-40 min-w-[10rem] min-h-[10rem] mx-auto">
                        <img
                            src={imagePreview || `${LINKS.API_BASE}/${form.asset_image}` || placeholder}
                            alt={form.name}
                            className="w-full h-full object-cover rounded-xl border border-gray-200"
                        />
                    </div>
                    {editMode && (
                        <input
                            type="file"
                            name="asset_image"
                            onChange={handleFileChange}
                            className="mt-2 w-40 mx-auto p-1 text-slate-500 text-sm rounded file:bg-indigo-100 file:text-indigo-700
                            file:font-semibold file:border-none file:px-1 file:py-1 file:mr-3 file:rounded hover:file:bg-indigo-200 border"
                        />
                    )}
                </div>

                {editMode && (
                    <div className="mb-4">
                        <label className="text-sm font-semibold text-gray-600">Name:</label>
                        {isEditing('name')}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-800">
                    <Detail label="Description" value={isEditing('asset_description')} />
                    {editMode && (
                        <Detail label="Code" value={isEditing('asset_running_number')} />
                    )}
                    <Detail
                        label="Category"
                        value={editMode ? (
                            <select
                                name="asset_category_id"
                                value={form.asset_category_id ?? ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        ) : (
                            <span>{asset.asset_category_name ?? ''}</span>
                        )}
                    />
                    <Detail
                        label="Tags"
                        value={editMode ? (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border rounded px-2 py-1">
                                {PRESET_TAG_OPTIONS.map(tag => (
                                    <label key={tag} className="inline-flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.asset_tag.includes(tag)}
                                            onChange={() => handleTagToggle(tag)}
                                            className="rounded accent-indigo-600"
                                        />
                                        <span className="text-sm text-gray-700">{tag}</span>
                                    </label>
                                ))}
                                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={otherChecked}
                                        onChange={() => {
                                            setOtherChecked(prev => {
                                                if (prev) setOtherText('');
                                                return !prev;
                                            });
                                        }}
                                        className="rounded accent-indigo-600"
                                    />
                                    <span className="text-sm text-gray-700">Others</span>
                                </label>
                                {otherChecked && (
                                    <input
                                        type="text"
                                        value={otherText}
                                        onChange={(e) => setOtherText(e.target.value)}
                                        placeholder="Specify..."
                                        className="text-sm border border-gray-300 rounded px-2 py-0.5 flex-1 min-w-[8rem] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                )}
                            </div>
                        ) : (
                            <span>{normalizeTags(asset.asset_tag).join(', ')}</span>
                        )}
                    />
                    <Detail label="Unit of Measure " value={isEditing('asset_unit_measure')} />
                    <Detail label="Cost" value={isEditing('asset_purchase_cost')} />
                    <Detail label="Price" value={isEditing('asset_sales_cost')} />
                    <Detail label="Stable Quantity" value={isEditing('asset_stable_unit')} />
                    {!editMode && (
                        <Detail label="Current Quantity" value={asset.branch_values?.find(bv => bv.asset_branch_id === user?.branch_id)?.asset_current_unit ?? 0} />
                    )}
                </div>

                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Remarks:</h3>
                    {editMode ? (
                        <textarea
                            name="assets_remark"
                            value={form.assets_remark ?? ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            rows={3}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{asset.assets_remark ?? ''}</p>
                    )}
                </div>

                {Array.isArray(branches) && branches.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Enabled in Branch:</h3>
                        <div className="border border-gray-200 rounded-xl overflow-hidden max-w-xs">
                            <div className="flex items-center px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-gray-500 bg-gray-50 border-b border-gray-200">
                                <span className="flex-1">Branch</span>
                                <span>Quantity</span>
                            </div>
                            <div className="max-h-56 overflow-y-auto">
                                {[...branches]
                                    .map(branch => {
                                        const alreadyEnabled = branchQtyMap.has(branch.id);
                                        const isChecked = alreadyEnabled
                                            ? !removedBranchIds.has(branch.id)
                                            : newBranchIds.has(branch.id);
                                        return { branch, isChecked };
                                    })
                                    .sort((a, b) => (a.isChecked === b.isChecked ? 0 : a.isChecked ? -1 : 1))
                                    .map(({ branch, isChecked }, idx) => (
                                        <label
                                            key={branch.id}
                                            className={`flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border-b border-gray-100 last:border-b-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} ${editMode ? 'cursor-pointer' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                disabled={!editMode}
                                                onChange={() => handleBranchToggle(branch.id)}
                                                className="rounded accent-indigo-600 disabled:opacity-100"
                                            />
                                            <span className="flex-1">{branch.name}</span>
                                            <span className="text-gray-500">{branchQtyMap.get(branch.id) ?? '—'}</span>
                                        </label>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {Array.isArray(logs) && logs.length > 0 && !editMode && (
                    <Section title="Logs" items={logs} />
                )}

            </div>
        </div>
    );
};

const Detail = ({ label, value }) => (
    <div>
        <span className="block text-center text-gray-600 font-medium">{label}:</span>
        <div className="text-gray-800 mt-1 text-center">{value}</div>
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
