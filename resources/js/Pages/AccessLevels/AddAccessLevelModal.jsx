import React, { useState } from 'react';
import api from '../../api/api';

const AddAccessLevelModal = ({ isOpen, onClose, onAccessLevelAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        add_edit_role: false,
        view_role: false,
        add_edit_user: false,
        view_user: false,
        add_edit_asset: false,
        view_asset: false,
        view_asset_masterlist: false,
        add_edit_branch: false,
        view_branch: false,
        add_edit_transaction: false,
        view_transaction: false,
        approve_reject_transaction: false,
        receive_transaction: false,
        add_edit_purchase_order: false,
        view_purchase_order: false,
        add_edit_supplier: false,
        view_supplier: false,
        add_edit_tax: false,
        view_tax: false,
        view_reports: false,
        download_reports: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            const response = await api.post('/api/access-levels', formData);
            
            if (response.data.data) {
                // Reset form
                setFormData({
                    name: '',
                    add_edit_role: false,
                    view_role: false,
                    add_edit_user: false,
                    view_user: false,
                    add_edit_asset: false,
                    view_asset: false,
                    view_asset_masterlist: false,
                    add_edit_branch: false,
                    view_branch: false,
                    add_edit_transaction: false,
                    view_transaction: false,
                    approve_reject_transaction: false,
                    receive_transaction: false,
                    add_edit_purchase_order: false,
                    view_purchase_order: false,
                    add_edit_supplier: false,
                    view_supplier: false,
                    add_edit_tax: false,
                    view_tax: false,
                    view_reports: false,
                    download_reports: false,
                });
                
                // Close modal and notify parent component
                onAccessLevelAdded(response.data.data);
                onClose();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Error adding access level:', error);
                setErrors({ general: 'An error occurred while adding the access level.' });
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600/70 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Add New Access Level</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {errors.general && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {errors.general}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`shadow appearance-none border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                            placeholder="Enter access level name"
                        />
                        {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
                    </div>

                    <div className="mb-4">
                        <h4 className="text-gray-700 font-bold mb-2">Role Permissions</h4>
                        <div className="pl-4 mb-2">
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="add_edit_role"
                                    name="add_edit_role"
                                    checked={formData.add_edit_role}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="add_edit_role" className="text-gray-700 text-sm">
                                    Add/Edit Role
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="view_role"
                                    name="view_role"
                                    checked={formData.view_role}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="view_role" className="text-gray-700 text-sm">
                                    View Role
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="text-gray-700 font-bold mb-2">User Permissions</h4>
                        <div className="pl-4 mb-2">
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="add_edit_user"
                                    name="add_edit_user"
                                    checked={formData.add_edit_user}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="add_edit_user" className="text-gray-700 text-sm">
                                    Add/Edit User
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="view_user"
                                    name="view_user"
                                    checked={formData.view_user}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="view_user" className="text-gray-700 text-sm">
                                    View User
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="text-gray-700 font-bold mb-2">Asset Permissions</h4>
                        <div className="pl-4 mb-2">
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="add_edit_asset"
                                    name="add_edit_asset"
                                    checked={formData.add_edit_asset}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="add_edit_asset" className="text-gray-700 text-sm">
                                    Add/Edit Asset
                                </label>
                            </div>
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="view_asset"
                                    name="view_asset"
                                    checked={formData.view_asset}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="view_asset" className="text-gray-700 text-sm">
                                    View Asset
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="view_asset_masterlist"
                                    name="view_asset_masterlist"
                                    checked={formData.view_asset_masterlist}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="view_asset_masterlist" className="text-gray-700 text-sm">
                                    View Asset Masterlist
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="text-gray-700 font-bold mb-2">Branch Permissions</h4>
                        <div className="pl-4 mb-2">
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="add_edit_branch"
                                    name="add_edit_branch"
                                    checked={formData.add_edit_branch}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="add_edit_branch" className="text-gray-700 text-sm">
                                    Add/Edit Branch
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="view_branch"
                                    name="view_branch"
                                    checked={formData.view_branch}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="view_branch" className="text-gray-700 text-sm">
                                    View Branch
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="text-gray-700 font-bold mb-2">Transaction Permissions</h4>
                        <div className="pl-4 mb-2">
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="add_edit_transaction"
                                    name="add_edit_transaction"
                                    checked={formData.add_edit_transaction}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="add_edit_transaction" className="text-gray-700 text-sm">
                                    Add/Edit Transaction
                                </label>
                            </div>
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="view_transaction"
                                    name="view_transaction"
                                    checked={formData.view_transaction}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="view_transaction" className="text-gray-700 text-sm">
                                    View Transaction
                                </label>
                            </div>
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="approve_reject_transaction"
                                    name="approve_reject_transaction"
                                    checked={formData.approve_reject_transaction}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="approve_reject_transaction" className="text-gray-700 text-sm">
                                    Approve/Reject Transaction
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="receive_transaction"
                                    name="receive_transaction"
                                    checked={formData.receive_transaction}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="receive_transaction" className="text-gray-700 text-sm">
                                    Receive Transaction
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="text-gray-700 font-bold mb-2">Report Permissions</h4>
                        <div className="pl-4 mb-2">
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="view_reports"
                                    name="view_reports"
                                    checked={formData.view_reports}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="view_reports" className="text-gray-700 text-sm">
                                    View Reports
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="download_reports"
                                    name="download_reports"
                                    checked={formData.download_reports}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="download_reports" className="text-gray-700 text-sm">
                                    Download Reports
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Adding...' : 'Add Access Level'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAccessLevelModal;
