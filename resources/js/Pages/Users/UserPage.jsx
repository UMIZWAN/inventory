import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head } from '@inertiajs/react';
import DataTable from 'react-data-table-component';
import { MdAlternateEmail } from "react-icons/md";
import { FiMapPin, FiUser } from 'react-icons/fi';
import { FaUserShield } from "react-icons/fa6";
import api from '../../api/api';
import Layout from '../../components/layout/Layout';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import { useAuth } from '../../context/AuthContext';
import ExportButton from '../../components/ExportButton';

const UserPage = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [branches, setBranches] = useState([]);
    const [successMessage, setSuccessMessage] = useState(null);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const debounceTimer = useRef(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, perPage]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            setCurrentPage(1);
            fetchUsers();
        }, 400);
        return () => clearTimeout(debounceTimer.current);
    }, [searchTerm, branchFilter]);

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

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/api/users-list', {
                params: {
                    page: currentPage,
                    per_page: perPage,
                    name: searchTerm,
                    ...(branchFilter && { branch_id: branchFilter }),
                },
            });

            if (response.data.success) {
                setUsers(response.data.data);
                setTotalRows(response.data.meta.total);
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

    const handleUserAdded = (newUser) => {
        fetchUsers();
        setSuccessMessage('User added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleEditClick = (u) => {
        setUserToEdit(u);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = async (u) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete ${u.name}?`);
        if (!confirmDelete) return;

        try {
            setLoading(true);
            const response = await api.patch(`/api/users/${u.id}/deactivate`);

            if (response.data.success) {
                setUsers(prevUsers => prevUsers.filter(item => item.id !== u.id));
                alert('User deleted successfully');
            } else {
                alert(response.data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('An error occurred while deleting the user');
        } finally {
            setLoading(false);
        }
    };

    const handleUserUpdated = (updatedUser) => {
        setUsers(prevUsers =>
            prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
        setSuccessMessage('User updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPerPage(newPerPage);
        setCurrentPage(page);
    };

    const handleExport = async (format) => {
        try {
            const response = await api.get('/api/users-list', {
                params: {
                    page: 1,
                    per_page: 9999,
                    name: searchTerm,
                    ...(branchFilter && { branch_id: branchFilter }),
                },
            });

            if (response.data.success) {
                const exportData = response.data.data.map(u => ({
                    Name: u.name,
                    Email: u.email,
                    Username: u.username || '',
                    'Access Level': u.access_level_name || '',
                    Branches: u.users_branch?.map(b => b.branch_name).join(', ') || '',
                }));

                const XLSX = await import('xlsx');
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
                const file = format === 'csv' ? 'Users.csv' : 'Users.xlsx';
                XLSX.writeFile(workbook, file, { bookType: format });
            }
        } catch (error) {
            console.error('Error exporting users:', error);
            alert('Failed to export users');
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

    const columns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Detail',
            cell: (row) => (
                <div className="py-2">
                    <div className="flex items-stretch gap-2 text-sm text-gray-700">
                        <MdAlternateEmail className="self-center" />
                        {row.email}
                    </div>
                    <div className="flex items-stretch gap-2 text-sm text-gray-700">
                        <FiUser className="self-center" />
                        {row.username ? row.username : <span className="text-gray-400 italic">Not provided</span>}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                        <FiMapPin className="mt-1" />
                        <div className="flex flex-wrap gap-1">
                            {row.users_branch?.map((branch) => (
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
                            {row.access_level_name}
                        </span>
                    </div>
                </div>
            ),
            grow: 2,
        },
        ...(user?.add_edit_user ? [{
            name: 'Actions',
            center: true,
            cell: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEditClick(row)}
                        className="text-indigo-600 hover:text-indigo-900"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="text-red-600 hover:text-red-900"
                    >
                        Delete
                    </button>
                </div>
            ),
        }] : []),
    ];

    const ExpandedComponent = ({ data }) => (
        <div className="py-4 px-2 bg-gray-50">
            <div className="border rounded-lg p-4 bg-white overflow-hidden">
                <h3 className="font-bold text-lg mb-3">Access Level Details: {data.access_level_name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex justify-between border-b pb-2">
                        <span>Add/Edit Role:</span>
                        {renderPermissionStatus(data.add_edit_role)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>View Role:</span>
                        {renderPermissionStatus(data.view_role)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>Settings:</span>
                        {renderPermissionStatus(data.settings)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>Add/Edit User:</span>
                        {renderPermissionStatus(data.add_edit_user)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>View User:</span>
                        {renderPermissionStatus(data.view_user)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>Add/Edit Asset:</span>
                        {renderPermissionStatus(data.add_edit_asset)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>View Asset:</span>
                        {renderPermissionStatus(data.view_asset)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>View Asset Masterlist:</span>
                        {renderPermissionStatus(data.view_asset_masterlist)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>Add/Edit Branch:</span>
                        {renderPermissionStatus(data.add_edit_branch)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>View Branch:</span>
                        {renderPermissionStatus(data.view_branch)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>Add/Edit Transaction:</span>
                        {renderPermissionStatus(data.add_edit_transaction)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>View Transaction:</span>
                        {renderPermissionStatus(data.view_transaction)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>Approve/Reject Transaction:</span>
                        {renderPermissionStatus(data.approve_reject_transaction)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>Receive Transaction:</span>
                        {renderPermissionStatus(data.receive_transaction)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>View Reports:</span>
                        {renderPermissionStatus(data.view_reports)}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>Download Reports:</span>
                        {renderPermissionStatus(data.download_reports)}
                    </div>
                </div>
            </div>
        </div>
    );

    const LoadingComponent = () => (
        <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
            <FiUser className="text-4xl text-gray-300" />
            <p className="text-lg font-medium">Loading users...</p>
        </div>
    );

    const NoDataComponent = () => (
        <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
            <FiUser className="text-4xl text-gray-300" />
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
        </div>
    );

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
                            {successMessage && (
                                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                                    <span className="block sm:inline">{successMessage}</span>
                                    <button
                                        onClick={() => setSuccessMessage(null)}
                                        className="absolute top-0 right-0 px-4 py-3"
                                    >
                                        <span className="text-green-700 text-xl">&times;</span>
                                    </button>
                                </div>
                            )}

                            {error ? (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <input
                                                type="text"
                                                placeholder="Search by name..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="px-3 py-1.5 text-sm rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                            <select
                                                value={branchFilter}
                                                onChange={(e) => setBranchFilter(e.target.value)}
                                                className="px-3 py-1.5 text-sm rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="">All Branches</option>
                                                {branches.map(branch => (
                                                    <option key={branch.id} value={branch.id}>
                                                        {branch.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <ExportButton
                                            onClick={handleExport}
                                            excelClassName="px-4 py-1.5 text-sm rounded-lg text-white bg-green-600 hover:bg-green-700"
                                            csvClassName="px-4 py-1.5 text-sm rounded-lg text-white bg-teal-600 hover:bg-teal-700"
                                        />
                                    </div>

                                    <DataTable
                                        columns={columns}
                                        data={users}
                                        progressPending={loading}
                                        progressComponent={<LoadingComponent />}
                                        pagination
                                        paginationServer
                                        paginationTotalRows={totalRows}
                                        paginationPerPage={perPage}
                                        paginationDefaultPage={currentPage}
                                        onChangePage={handlePageChange}
                                        onChangeRowsPerPage={handlePerRowsChange}
                                        expandableRows
                                        expandableRowsComponent={ExpandedComponent}
                                        highlightOnHover
                                        striped
                                        noDataComponent={<NoDataComponent />}
                                    />
                                </>
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
