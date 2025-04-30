import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import api from '../../api/api';
import Layout from '../../components/layout/Layout';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';

const UserPage = ({ auth }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/api/users-list');
            if (response.data.success) {
                setUsers(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('An error occurred while fetching users');
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(selectedUser?.id === user.id ? null : user);
    };

    const handleUserAdded = (newUser) => {
        setUsers(prevUsers => [...prevUsers, newUser]);
    };

    const handleEditClick = (user, e) => {
        e.stopPropagation(); // Prevent row click event
        setUserToEdit(user);
        setIsEditModalOpen(true);
    };

    const handleUserUpdated = (updatedUser) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === updatedUser.id ? updatedUser : user
            )
        );
        
        // If this user was selected, update the selected user as well
        if (selectedUser && selectedUser.id === updatedUser.id) {
            setSelectedUser(updatedUser);
        }
    };

    const renderPermissionStatus = (value) => {
        return value ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Allowed
            </span>
        ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Denied
            </span>
        );
    };

    return (
        <Layout>
            <div className="py-12">
                <Head title="Users" />
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold">Users</h1>
                                <button 
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Add User
                                </button>
                            </div>
                            
                            {loading ? (
                                <p className="text-center py-4">Loading users...</p>
                            ) : error ? (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Level</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.length > 0 ? (
                                                users.map(user => (
                                                    <React.Fragment key={user.id}>
                                                        <tr
                                                            className={`hover:bg-gray-50 ${selectedUser?.id === user.id ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <td 
                                                                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                                                onClick={() => handleUserClick(user)}
                                                            >{user.id}</td>
                                                            <td 
                                                                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                                                onClick={() => handleUserClick(user)}
                                                            >{user.name}</td>
                                                            <td 
                                                                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                                                onClick={() => handleUserClick(user)}
                                                            >{user.email}</td>
                                                            <td 
                                                                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                                                onClick={() => handleUserClick(user)}
                                                            >{user.branch_name}</td>
                                                            <td 
                                                                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                                                onClick={() => handleUserClick(user)}
                                                            >
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                    {user.access_level_name}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <button 
                                                                    onClick={(e) => handleEditClick(user, e)}
                                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                                >
                                                                    Edit
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        {selectedUser?.id === user.id && (
                                                            <tr>
                                                                <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                                                    <div className="border rounded-lg p-4 bg-white">
                                                                        <h3 className="font-bold text-lg mb-3">Access Level Details: {user.access_level_name}</h3>
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Role:</span>
                                                                                {renderPermissionStatus(user.add_edit_role)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Role:</span>
                                                                                {renderPermissionStatus(user.view_role)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit User:</span>
                                                                                {renderPermissionStatus(user.add_edit_user)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View User:</span>
                                                                                {renderPermissionStatus(user.view_user)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Asset:</span>
                                                                                {renderPermissionStatus(user.add_edit_asset)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Asset:</span>
                                                                                {renderPermissionStatus(user.view_asset)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Branch:</span>
                                                                                {renderPermissionStatus(user.add_edit_branch)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Branch:</span>
                                                                                {renderPermissionStatus(user.view_branch)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Transaction:</span>
                                                                                {renderPermissionStatus(user.add_edit_transaction)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Transaction:</span>
                                                                                {renderPermissionStatus(user.view_transaction)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Approve/Reject Transaction:</span>
                                                                                {renderPermissionStatus(user.approve_reject_transaction)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Receive Transaction:</span>
                                                                                {renderPermissionStatus(user.receive_transaction)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Purchase Order:</span>
                                                                                {renderPermissionStatus(user.add_edit_purchase_order)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Purchase Order:</span>
                                                                                {renderPermissionStatus(user.view_purchase_order)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Supplier:</span>
                                                                                {renderPermissionStatus(user.add_edit_supplier)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Supplier:</span>
                                                                                {renderPermissionStatus(user.view_supplier)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Tax:</span>
                                                                                {renderPermissionStatus(user.add_edit_tax)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Tax:</span>
                                                                                {renderPermissionStatus(user.view_tax)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Reports:</span>
                                                                                {renderPermissionStatus(user.view_reports)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Download Reports:</span>
                                                                                {renderPermissionStatus(user.download_reports)}
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
                                                    <td colSpan="6" className="px-6 py-4 text-center">No users found</td>
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

            {/* Add User Modal */}
            <AddUserModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onUserAdded={(newUser) => {
                    handleUserAdded(newUser);
                }}
            />

            {/* Edit User Modal */}
            <EditUserModal 
                isOpen={isEditModalOpen} 
                onClose={() => {
                    setIsEditModalOpen(false);
                    setUserToEdit(null);
                }} 
                user={userToEdit}
                onUserUpdated={handleUserUpdated}
            />
        </Layout>
    );
};

export default UserPage;
