import React, { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import api from '../../api/api';
import Layout from '../../components/layout/Layout';
import AddAccessLevelModal from './AddAccessLevelModal';
import EditAccessLevelModal from './EditAccessLevelModal';
import { useAuth } from '../../context/AuthContext';

const AccessLevelsPage = ({ auth }) => {
    const { user } = useAuth();
    const [accessLevels, setAccessLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedAccessLevel, setSelectedAccessLevel] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [accessLevelToEdit, setAccessLevelToEdit] = useState(null);

    // Fetch Access Levels (Memoized using useCallback)
    const fetchAccessLevels = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/api/access-levels');
            if (response.data.success) {
                setAccessLevels(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch access levels');
            }
        } catch (error) {
            console.error('Error fetching access levels:', error);
            setError('An error occurred while fetching access levels');
        } finally {
            setLoading(false);
        }
    }, []); // Dependency array is empty since it doesn't depend on any props or state

    // Handle Access Level Click (Memoized)
    const handleAccessLevelClick = useCallback((accessLevel) => {
        setSelectedAccessLevel(prev => prev?.id === accessLevel.id ? null : accessLevel);
    }, []);

    // Handle Add Access Level (Memoized)
    const handleAccessLevelAdded = useCallback((newAccessLevel) => {
        setAccessLevels(prevAccessLevels => [...prevAccessLevels, newAccessLevel]);
    }, []);

    // Handle Edit Access Level Click (Memoized)
    const handleEditClick = useCallback((accessLevel, e) => {
        e.stopPropagation(); // Prevent row click event
        setAccessLevelToEdit(accessLevel);
        setIsEditModalOpen(true);
    }, []);

    // Handle Access Level Update (Memoized)
    const handleAccessLevelUpdated = useCallback((updatedAccessLevel) => {
        setAccessLevels(prevAccessLevels =>
            prevAccessLevels.map(accessLevel =>
                accessLevel.id === updatedAccessLevel.id ? updatedAccessLevel : accessLevel
            )
        );

        // If this access level was selected, update the selected access level as well
        if (selectedAccessLevel && selectedAccessLevel.id === updatedAccessLevel.id) {
            setSelectedAccessLevel(updatedAccessLevel);
        }
    }, [selectedAccessLevel]); // Dependency array includes selectedAccessLevel to update it accordingly

    // Render Permission Status
    const renderPermissionStatus = useCallback((value) => {
        return value ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Allowed
            </span>
        ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Denied
            </span>
        );
    }, []); // No dependencies since it doesn't change

    // useEffect to fetch data on mount
    useEffect(() => {
        fetchAccessLevels();
    }, [fetchAccessLevels]); // Ensure fetchAccessLevels is called once on mount

    return (
        <Layout>
            <div className="py-6">
                <Head title="Access Levels" />
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Access Levels</h1>
                        {user?.add_edit_role && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Add Access Level
                            </button>
                        )}
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">

                            {loading ? (
                                <p className="text-center py-4">Loading access levels...</p>
                            ) : error ? (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                {user?.add_edit_role && (
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {accessLevels.length > 0 ? (
                                                accessLevels.map(accessLevel => (
                                                    <React.Fragment key={accessLevel.id}>
                                                        <tr
                                                            className={`hover:bg-gray-50 ${selectedAccessLevel?.id === accessLevel.id ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <td
                                                                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                                                onClick={() => handleAccessLevelClick(accessLevel)}
                                                            >{accessLevel.name}</td>
                                                            {user?.add_edit_role && (
                                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                    <button
                                                                        onClick={(e) => handleEditClick(accessLevel, e)}
                                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                        {selectedAccessLevel?.id === accessLevel.id && (
                                                            <tr>
                                                                <td colSpan="3" className="px-6 py-4 bg-gray-50">
                                                                    <div className="border rounded-lg p-4 bg-white">
                                                                        <h3 className="font-bold text-lg mb-3">Access Level Details: {accessLevel.name}</h3>
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Role:</span>
                                                                                {renderPermissionStatus(accessLevel.add_edit_role)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Role:</span>
                                                                                {renderPermissionStatus(accessLevel.view_role)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Settings:</span>
                                                                                {renderPermissionStatus(accessLevel.settings)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit User:</span>
                                                                                {renderPermissionStatus(accessLevel.add_edit_user)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View User:</span>
                                                                                {renderPermissionStatus(accessLevel.view_user)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Asset:</span>
                                                                                {renderPermissionStatus(accessLevel.add_edit_asset)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Asset:</span>
                                                                                {renderPermissionStatus(accessLevel.view_asset)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Asset Masterlist:</span>
                                                                                {renderPermissionStatus(accessLevel.view_asset_masterlist)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Branch:</span>
                                                                                {renderPermissionStatus(accessLevel.add_edit_branch)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Branch:</span>
                                                                                {renderPermissionStatus(accessLevel.view_branch)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Transaction:</span>
                                                                                {renderPermissionStatus(accessLevel.add_edit_transaction)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Transaction:</span>
                                                                                {renderPermissionStatus(accessLevel.view_transaction)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Approve/Reject Transaction:</span>
                                                                                {renderPermissionStatus(accessLevel.approve_reject_transaction)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Receive Transaction:</span>
                                                                                {renderPermissionStatus(accessLevel.receive_transaction)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Reports:</span>
                                                                                {renderPermissionStatus(accessLevel.view_reports)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Download Reports:</span>
                                                                                {renderPermissionStatus(accessLevel.download_reports)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-4 text-center">No access levels found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Access Level Modal */}
            <AddAccessLevelModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAccessLevelAdded={handleAccessLevelAdded}
            />

            {/* Edit Access Level Modal */}
            <EditAccessLevelModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setAccessLevelToEdit(null);
                }}
                accessLevel={accessLevelToEdit}
                onAccessLevelUpdated={handleAccessLevelUpdated}
            />
        </Layout>
    );
};

export default AccessLevelsPage;
