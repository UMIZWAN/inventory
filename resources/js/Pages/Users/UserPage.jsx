import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { MdAlternateEmail } from "react-icons/md";
import { FiMapPin } from 'react-icons/fi';
import { FaUserShield } from "react-icons/fa6";
import api from '../../api/api';
import Layout from '../../components/layout/Layout';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination';

const UserPage = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 10,
        total: 0,
        lastPage: 1
    });

    useEffect(() => {
        fetchUsers();
    }, [pagination.currentPage]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/api/users-list', {
                params: {
                    page: pagination.currentPage,
                    name: searchTerm,
                },
            });

            if (response.data.success) {
                setUsers(response.data.data);
                setPagination({
                    currentPage: response.data.meta.current_page,
                    perPage: response.data.meta.per_page,
                    total: response.data.meta.total,
                    lastPage: response.data.meta.last_page,
                });
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
            <div className="py-6">
                <Head title="Users" />
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Users</h1>
                        {user?.add_edit_user && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Add User
                            </button>
                        )}
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">

                            {loading ? (
                                <p className="text-center py-4">Loading users...</p>
                            ) : error ? (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <div className="mb-4 flex flex-wrap gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="Search by name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="px-3 py-1 rounded-full border border-gray-300 w-full sm:w-1/3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={() => {
                                                setPagination(prev => ({ ...prev, currentPage: 1 }));
                                                fetchUsers();
                                            }}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Search
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                // setPagination(prev => ({ ...prev, currentPage: 1 }));
                                                fetchUsers();
                                            }}
                                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                        >
                                            Reset
                                        </button>
                                    </div>

                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
                                                {user?.add_edit_user && (
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.length > 0 ? (
                                                users.map(u => (
                                                    <React.Fragment key={u.id}>
                                                        <tr
                                                            className={`hover:bg-gray-50 ${selectedUser?.id === u.id ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <td
                                                                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                                                onClick={() => handleUserClick(u)}
                                                            >{u.name}</td>
                                                            <td
                                                                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                                                onClick={() => handleUserClick(u)}
                                                            >
                                                                <div>
                                                                    <div className="flex items-stretch gap-2 text-sm text-gray-700">
                                                                        <MdAlternateEmail className="self-center" />
                                                                        {u.email}
                                                                    </div>
                                                                    <div className="flex items-start gap-2 text-sm text-gray-700">
                                                                        <FiMapPin className="mt-1" />
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {u.users_branch?.map((branch) => (
                                                                                <span
                                                                                    key={branch.id}
                                                                                    className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full"
                                                                                >
                                                                                    {branch.branch_name}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-stretch gap-2 text-sm text-gray-700">
                                                                        <FaUserShield className="self-center" />
                                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                            {u.access_level_name}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {user?.add_edit_user && (
                                                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                                                    <button
                                                                        onClick={(e) => handleEditClick(u, e)}
                                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                        {selectedUser?.id === u.id && (
                                                            <tr>
                                                                <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                                                    <div className="border rounded-lg p-4 bg-white">
                                                                        <h3 className="font-bold text-lg mb-3">Access Level Details: {u.access_level_name}</h3>
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Role:</span>
                                                                                {renderPermissionStatus(u.add_edit_role)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Role:</span>
                                                                                {renderPermissionStatus(u.view_role)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Settings:</span>
                                                                                {renderPermissionStatus(u.settings)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit User:</span>
                                                                                {renderPermissionStatus(u.add_edit_user)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View User:</span>
                                                                                {renderPermissionStatus(u.view_user)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Asset:</span>
                                                                                {renderPermissionStatus(u.add_edit_asset)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Asset:</span>
                                                                                {renderPermissionStatus(u.view_asset)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Asset Masterlist:</span>
                                                                                {renderPermissionStatus(u.view_asset_masterlist)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Branch:</span>
                                                                                {renderPermissionStatus(u.add_edit_branch)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Branch:</span>
                                                                                {renderPermissionStatus(u.view_branch)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Add/Edit Transaction:</span>
                                                                                {renderPermissionStatus(u.add_edit_transaction)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Transaction:</span>
                                                                                {renderPermissionStatus(u.view_transaction)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Approve/Reject Transaction:</span>
                                                                                {renderPermissionStatus(u.approve_reject_transaction)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Receive Transaction:</span>
                                                                                {renderPermissionStatus(u.receive_transaction)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>View Reports:</span>
                                                                                {renderPermissionStatus(u.view_reports)}
                                                                            </div>
                                                                            <div className="flex justify-between border-b pb-2">
                                                                                <span>Download Reports:</span>
                                                                                {renderPermissionStatus(u.download_reports)}
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
                                    <Pagination
                                        pagination={pagination}
                                        onPageChange={(page) => {
                                            setPagination(prev => ({ ...prev, currentPage: page }));
                                        }}
                                    />
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
