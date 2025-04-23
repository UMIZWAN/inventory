import React, { useState } from "react";
import { useAssetMeta } from '../context/AssetsContext';

function AddAsset({ setShowModal }) {
    const { categories, branches, tags, loading: metaLoading } = useAssetMeta();
    const [form, setForm] = useState({
        name: '',
        asset_type: '',
        asset_running_number: '',
        asset_category_id: '',
        asset_tag_id: '',
        assets_branch_id: '',
        asset_stable_value: '',
        asset_current_value: '',
        assets_location: '',
        assets_remark: '',
        asset_image: null
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (key === 'assets_remark') {
                value.split('\n').forEach((line, i) => {
                    formData.append(`assets_remark[${i}]`, line);
                });
            } else {
                formData.append(key, value);
            }
        });

        api.post('/api/assets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(() => {
                alert('Asset added successfully!');
                setShowModal(false);
                fetchAssets();
                setForm({
                    name: '',
                    asset_type: '',
                    asset_running_number: '',
                    asset_category_id: '',
                    asset_tag_id: '',
                    assets_branch_id: '',
                    asset_stable_value: '',
                    asset_current_value: '',
                    assets_location: '',
                    assets_remark: '',
                    asset_image: null
                });
            })
            .catch(error => {
                console.error('Error adding asset:', error);
                alert('Failed to add asset.');
            });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Add New Asset</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="asset_type" placeholder="Type" value={form.asset_type} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="asset_running_number" placeholder="Item Code" value={form.asset_running_number} onChange={handleChange} className="w-full p-2 border rounded" required />

                    {/* Category Dropdown */}
                    <select name="asset_category_id" value={form.asset_category_id || ''} onChange={handleChange} className="w-full p-2 border rounded" required>
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    {/* Tag Dropdown */}
                    <select name="asset_tag_id" value={form.asset_tag_id || ''} onChange={handleChange} className="w-full p-2 border rounded" required>
                        <option value="">Select Tag</option>
                        {tags.map((tag) => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                    </select>

                    {/* Branch Dropdown */}
                    <select name="assets_branch_id" value={form.assets_branch_id || ''} onChange={handleChange} className="w-full p-2 border rounded" required>
                        <option value="">Select Branch</option>
                        {branches.map((br) => (
                            <option key={br.id} value={br.id}>{br.name}</option>
                        ))}
                    </select>

                    {/* <input name="asset_stable_value" type="number" placeholder="Stable Value" value={form.asset_stable_value} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="asset_current_value" type="number" placeholder="Current Value" value={form.asset_current_value} onChange={handleChange} className="w-full p-2 border rounded" required /> */}
                    <input name="assets_location" placeholder="Location" value={form.assets_location} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <textarea name="assets_remark" placeholder="Remarks (each line becomes a remark)" value={form.assets_remark} onChange={handleChange} className="w-full p-2 border rounded" rows="3" />

                    {/* File Input */}
                    <input type="file" name="asset_image" onChange={(e) => setForm({ ...form, asset_image: e.target.files[0] })} className="w-full p-2 border rounded" />

                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddAsset;