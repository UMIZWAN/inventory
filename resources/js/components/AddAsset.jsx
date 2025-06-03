import React, { useEffect, useState } from "react";
import { useAssetMeta } from '../context/AssetsContext';
import { useAuth } from "../context/AuthContext";

function AddAsset({ setShowModal }) {
    const { user } = useAuth();
    const { categories, branches, addAsset } = useAssetMeta();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        asset_description: '',
        asset_type: '',
        asset_running_number: '',
        asset_category_id: '',
        assets_branch_id: '',
        asset_purchase_cost: '',
        asset_sales_cost: '',
        asset_stable_unit: '',
        asset_unit_measure: '',
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
        setSubmitting(true);
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
                assets_branch_id: '',
                asset_purchase_cost: '',
                asset_sales_cost: '',
                asset_stable_unit: '',
                asset_unit_measure: '',
                assets_remark: "",
                asset_image: ''
            });
            setImagePreview(null);
        } catch (error) {
            console.error('Error adding asset:', error);
            alert('Failed to add asset.');
        } finally {
            setSubmitting(false);
        }
    };

    const label = (text, required = false) => (
        <label className="text-sm font-medium text-gray-700">
            {text} {required && <span className="text-red-500">*</span>}
        </label>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-2xl">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Asset</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                        {label("Name", true)}
                        <input name="name" value={form.name} onChange={handleChange} required className="p-2 border rounded" />
                    </div>

                    <div className="flex flex-col">
                        {label("Branch")}
                        <input value={user?.branch_name || ''} disabled className="p-2 border rounded bg-gray-100 text-gray-500" />
                    </div>

                    <div className="flex flex-col">
                        {label("Type")}
                        <input name="asset_type" value={form.asset_type} onChange={handleChange} className="p-2 border rounded" />
                    </div>

                    <div className="flex flex-col">
                        {label("Description")}
                        <input name="asset_description" value={form.asset_description} onChange={handleChange} className="p-2 border rounded" />
                    </div>

                    <div className="flex flex-col">
                        {label("Item Code", true)}
                        <input name="asset_running_number" value={form.asset_running_number} onChange={handleChange} required className="p-2 border rounded" />
                    </div>

                    <div className="flex flex-col">
                        {label("Category", true)}
                        <select name="asset_category_id" value={form.asset_category_id} onChange={handleChange} required className="p-2 border rounded">
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        {label("Cost")}
                        <input name="asset_purchase_cost" type="number" value={form.asset_purchase_cost} onChange={handleChange} className="p-2 border rounded" />
                    </div>

                    <div className="flex flex-col">
                        {label("Price")}
                        <input name="asset_sales_cost" type="number" value={form.asset_sales_cost} onChange={handleChange} className="p-2 border rounded" />
                    </div>

                    <div className="flex flex-col">
                        {label("Stable Quantity", true)}
                        <input name="asset_stable_unit" type="number" value={form.asset_stable_unit} onChange={handleChange} required className="p-2 border rounded" />
                    </div>

                    <div className="flex flex-col">
                        {label("Unit of Measure", true)}
                        <input name="asset_unit_measure" value={form.asset_unit_measure} onChange={handleChange} required className="p-2 border rounded" />
                    </div>

                    <div className="flex flex-col col-span-2">
                        {label("Remarks")}
                        <textarea name="assets_remark" value={form.assets_remark} onChange={handleChange} rows="3" className="p-2 border rounded" />
                    </div>

                    <div className="col-span-2 flex flex-col space-y-2">
                        {label("Image Upload")}
                        <input
                            type="file"
                            name="asset_image"
                            onChange={handleFileChange}
                            className="p-1 text-slate-500 text-sm rounded leading-6 file:bg-blue-200 file:text-blue-700 
                            file:font-semibold file:border-none file:px-4 file:py-1 file:mr-6 file:rounded hover:file:bg-blue-100 border"
                        />
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover border rounded-lg" />
                        )}
                    </div>

                    <div className="col-span-2 flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-sm"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submitting}
                        >
                            {submitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddAsset;
