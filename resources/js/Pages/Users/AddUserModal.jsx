import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        access_level_id: '',
        branch_id: []
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [accessLevels, setAccessLevels] = useState([]);
    const [branches, setBranches] = useState([]);
    const [branchSearch, setBranchSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAccessLevels();
            fetchBranches();
        }
    }, [isOpen]);

    const fetchAccessLevels = async () => {
        try {
            const response = await api.get('/api/access-levels');
            if (response.data.success) {
                setAccessLevels(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching access levels:', error);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await api.get('/api/assets-branch');
            if (response.data.success) {
                setBranches(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: null
            }));
        }
    };

    const handleBranchCheckboxChange = (e) => {
        const value = parseInt(e.target.value);
        const isChecked = e.target.checked;

        setFormData(prev => {
            const updated = isChecked
                ? [...prev.branch_id, value]
                : prev.branch_id.filter(id => id !== value);
            return { ...prev, branch_id: updated };
        });

        if (errors.branch_id) {
            setErrors(prev => ({
                ...prev,
                branch_id: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await api.post('/api/users', formData);

            if (response.data.data) {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    password_confirmation: '',
                    access_level_id: '',
                    branch_id: []
                });

                onUserAdded(response.data.data);
                onClose();
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Error adding user:', error);
                setErrors({ general: 'An error occurred while adding the user.' });
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Add New User</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
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

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm`}
                            placeholder="Enter name"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm`}
                            placeholder="Enter email"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm`}
                            placeholder="Enter password"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className={`w-full border ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm`}
                            placeholder="Confirm password"
                        />
                        {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">Access Level</label>
                        <select
                            name="access_level_id"
                            value={formData.access_level_id}
                            onChange={handleChange}
                            className={`w-full border ${errors.access_level_id ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm`}
                        >
                            <option value="">Select Access Level</option>
                            {accessLevels.map(level => (
                                <option key={level.id} value={level.id}>{level.name}</option>
                            ))}
                        </select>
                        {errors.access_level_id && <p className="text-red-500 text-xs mt-1">{errors.access_level_id}</p>}
                    </div>

                    <div className="mb-4 relative">
                        <label className="block text-sm font-bold mb-2">Branches</label>

                        <input
                            type="text"
                            placeholder="Search branches..."
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-2 text-sm focus:outline-none"
                            onChange={(e) => setBranchSearch(e.target.value.toLowerCase())}
                        />

                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white shadow-sm">
                            {branches
                                .filter(branch => branch.name.toLowerCase().includes(branchSearch))
                                .slice(0, 4)
                                .map(branch => (
                                    <label key={branch.id} className="flex items-center space-x-2 py-1">
                                        <input
                                            type="checkbox"
                                            value={branch.id}
                                            checked={formData.branch_id.includes(branch.id)}
                                            onChange={handleBranchCheckboxChange}
                                            className="form-checkbox h-4 w-4 text-blue-600"
                                        />
                                        <span className="text-sm text-gray-700">{branch.name}</span>
                                    </label>
                                ))}
                        </div>

                        {formData.branch_id.length > 0 && (
                            <div className="mt-3">
                                <p className="text-sm font-semibold mb-1 text-gray-700">Selected Branches:</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.branch_id.map(id => {
                                        const branch = branches.find(b => b.id === id);
                                        return branch ? (
                                            <span
                                                key={id}
                                                className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                                            >
                                                {branch.name}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}

                        {errors.branch_id && <p className="text-red-500 text-xs italic mt-1">{errors.branch_id}</p>}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
