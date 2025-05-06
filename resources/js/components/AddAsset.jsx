import React, { useEffect, useState } from "react";
import { useAssetMeta } from '../context/AssetsContext';
import { useAuth } from "../context/AuthContext";

function AddAsset({ setShowModal }) {
    const { user } = useAuth();
    const { categories, branches, tags, addAsset } = useAssetMeta();
    const [form, setForm] = useState({
        name: '',
        asset_description: '',
        asset_type: '',
        asset_running_number: '',
        asset_category_id: '',
        // asset_tag_id: '',
        assets_branch_id: '',
        asset_purchase_cost: '',
        asset_sales_cost: '',
        asset_stable_unit: '',
        asset_unit_measure: '',
        // assets_location_id: '',
        assets_remark: "",
        asset_image: ''
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (user?.branch_id) {
            setForm((prev) => ({
                ...prev,
                assets_branch_id: user.branch_id,
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await addAsset(form);
            alert('Asset added successfully!');
            setShowModal(false);
            setForm({
                name: '',
                asset_description: '',
                asset_type: '',
                asset_running_number: '',
                asset_category_id: '',
                // asset_tag_id: '',
                assets_branch_id: '',
                asset_purchase_cost: '',
                asset_sales_cost: '',
                asset_stable_unit: '',
                asset_unit_measure: '',
                // assets_location_id: '',
                assets_remark: "",
                asset_image: ''
            });
            setImagePreview(null);
        } catch (error) {
            console.error('Error adding asset:', error);
            alert('Failed to add asset.');
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-2xl">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Asset</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input
                        name="assets_branch_id"
                        value={user?.branch_name || ''}
                        disabled
                        className="w-full p-2 border rounded bg-gray-100 text-gray-500"
                    />
                    <input name="asset_type" placeholder="Type" value={form.asset_type} onChange={handleChange} className="w-full p-2 border rounded" />
                    <input name="asset_description" placeholder="Description" value={form.asset_description} onChange={handleChange} className="w-full p-2 border rounded" />
                    <input name="asset_running_number" placeholder="Item Code" value={form.asset_running_number} onChange={handleChange} className="w-full p-2 border rounded" required />

                    <select name="asset_category_id" value={form.asset_category_id || ''} onChange={handleChange} className="w-full p-2 border rounded" required>
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    {/* <select name="asset_tag_id" value={form.asset_tag_id || ''} onChange={handleChange} className="w-full p-2 border rounded" required>
                        <option value="">Select Tag</option>
                        {tags.map((tag) => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                    </select> */}

                    <input name="asset_purchase_cost" type="number" placeholder="Cost" value={form.asset_purchase_cost} onChange={handleChange} className="w-full p-2 border rounded" />
                    <input name="asset_sales_cost" type="number" placeholder="Price" value={form.asset_sales_cost} onChange={handleChange} className="w-full p-2 border rounded" />
                    <input name="asset_stable_unit" type="number" placeholder="Stable Quantity" value={form.asset_stable_unit} onChange={handleChange} className="w-full p-2 border rounded" />
                    <input name="asset_unit_measure" placeholder="UOM" value={form.unit_measure} onChange={handleChange} className="w-full p-2 border rounded" />

                    {/* <select name="assets_location_id" value={form.assets_location_id || ''} onChange={handleChange} className="w-full p-2 border rounded" required>
                        <option value="">Select Location</option>
                        {branches.map((br) => (
                            <option key={br.id} value={br.id}>{br.name}</option>
                        ))}
                    </select> */}

                    <textarea name="assets_remark" placeholder="Remarks" value={form.assets_remark} onChange={handleChange} className="w-full p-2 border rounded col-span-2" rows="3" />

                    <div className="col-span-2 space-y-2">
                        <input type="file" name="asset_image" onChange={handleFileChange} className="w-full p-2 border rounded" />
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover border rounded-lg" />
                        )}
                    </div>

                    <div className="col-span-2 flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddAsset;
