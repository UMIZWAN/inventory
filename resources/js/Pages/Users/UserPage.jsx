import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { FiMapPin, FiUser, FiChevronRight, FiSearch, FiCheckCircle } from 'react-icons/fi';
import api from '../../api/api';
import Layout from '../../components/layout/Layout';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import { useAuth } from '../../context/AuthContext';
import ExportButton from '../../components/ExportButton';
import Pagination from '../../components/Pagination';

const PERM_GROUPS = [
    ['Roles', [['view_role', 'View Role'], ['add_edit_role', 'Add/Edit Role']]],
    ['Users', [['view_user', 'View User'], ['add_edit_user', 'Add/Edit User']]],
    ['Assets', [['view_asset', 'View Asset'], ['view_asset_masterlist', 'View Asset Masterlist'], ['add_edit_asset', 'Add/Edit Asset']]],
    ['Branches', [['view_branch', 'View Branch'], ['add_edit_branch', 'Add/Edit Branch']]],
    ['Transactions', [['view_transaction', 'View Transaction'], ['add_edit_transaction', 'Add/Edit Transaction'], ['receive_transaction', 'Receive Transaction'], ['approve_reject_transaction', 'Approve/Reject Transaction']]],
    ['Reports', [['view_reports', 'View Reports'], ['download_reports', 'Download Reports']]],
    ['General', [['settings', 'Settings']]],
];

const GRID_COLS = { display: 'grid', gridTemplateColumns: '32px 1.3fr 1.3fr 160px 110px' };

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
    const [accessLevelFilter, setAccessLevelFilter] = useState('');
    const [accessLevels, setAccessLevels] = useState([]);
    const [successMessage, setSuccessMessage] = useState(null);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedIds, setExpandedIds] = useState(new Set());

    const debounceTimer = useRef(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        fetchBranches();
        fetchAccessLevels();
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
    }, [searchTerm, branchFilter, accessLevelFilter]);

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
                    ...(accessLevelFilter && { access_level_id: accessLevelFilter }),
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

    const handleUserAdded = () => {
        fetchUsers();
        setSuccessMessage('User added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleEditClick = (u) => {
        setUserToEdit(u);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = async (u) => {
        const confirmDelete = window.confirm(`Are you sure you want to deactivate ${u.name}?`);
        if (!confirmDelete) return;

        try {
            setLoading(true);
            const response = await api.patch(`/api/users/${u.id}/deactivate`);

            if (response.data.success) {
                setUsers(prevUsers => prevUsers.filter(item => item.id !== u.id));
                alert('User deactivated successfully');
            } else {
                alert(response.data.message || 'Failed to deactivate user');
            }
        } catch (error) {
            console.error('Error deactivating user:', error);
            alert('An error occurred while deactivating the user');
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

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setCurrentPage(1);
    };

    const handleExport = async (format) => {
        try {
            const response = await api.get('/api/users-list', {
                params: {
                    page: 1,
                    per_page: 9999,
                    name: searchTerm,
                    ...(branchFilter && { branch_id: branchFilter }),
                    ...(accessLevelFilter && { access_level_id: accessLevelFilter }),
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

    const toggleExpand = (id) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const pagination = {
        currentPage,
        perPage,
        total: totalRows,
        lastPage: Math.max(1, Math.ceil(totalRows / perPage)),
    };

    return (
        <Layout>
            <Head title="Users" />
            <div className="py-1 px-1">
                <div className="border border-gray-200 rounded-2xl bg-white p-4 shadow-sm">
                    {successMessage && (
                        <div className="mb-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-lg text-sm relative">
                            <span>{successMessage}</span>
                            <button
                                onClick={() => setSuccessMessage(null)}
                                className="absolute top-0 right-0 px-3 py-2 text-green-600 hover:text-green-800"
                            >
                                &times;
                            </button>
                        </div>
                    )}

                    {/* Panel head: search + filter + export + add */}
                    <div className="flex flex-nowrap items-center justify-between gap-3 mb-3">
                        <div className="flex flex-nowrap items-center gap-3 min-w-0">
                            <div className="relative w-[220px] flex-shrink-0">
                                <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search by name…"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full min-h-[38px] pl-[30px] pr-3 text-sm bg-white border-0 border-b border-gray-200 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <select
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                className="min-h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">All Branches</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={accessLevelFilter}
                                onChange={(e) => setAccessLevelFilter(e.target.value)}
                                className="min-h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">All Access Levels</option>
                                {accessLevels.map(level => (
                                    <option key={level.id} value={level.id}>
                                        {level.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <ExportButton
                                onClick={handleExport}
                                excelClassName="px-3 py-2 text-xs rounded-lg text-white bg-green-600 hover:bg-green-700"
                                csvClassName="px-3 py-2 text-xs rounded-lg text-white bg-teal-600 hover:bg-teal-700"
                            />
                            {user?.add_edit_user && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Add User
                                </button>
                            )}
                        </div>
                    </div>

                    {error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
                            <FiUser className="text-4xl text-gray-300" />
                            <p className="text-lg font-medium">Loading users...</p>
                        </div>
                    ) : (
                        <>
                            {/* Table head */}
                            <div
                                style={GRID_COLS}
                                className="px-3 pb-2 text-[11px] uppercase tracking-[0.08em] text-gray-500 border-b border-gray-200 mb-1"
                            >
                                <span></span>
                                <span>Name</span>
                                <span>Email/Username</span>
                                <span>Access Level</span>
                                <span>Actions</span>
                            </div>

                            {/* Rows */}
                            {users.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
                                    <FiUser className="text-4xl text-gray-300" />
                                    <p className="text-lg font-medium">No users found</p>
                                    <p className="text-sm">Try adjusting your search or filter criteria.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {users.map((row) => {
                                        const isOpen = expandedIds.has(row.id);
                                        return (
                                            <div key={row.id}>
                                                <div
                                                    style={GRID_COLS}
                                                    onClick={() => toggleExpand(row.id)}
                                                    className={`items-center px-3 py-3.5 text-sm border-b border-gray-100 cursor-pointer transition-colors ${
                                                        isOpen ? 'bg-indigo-50' : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <FiChevronRight
                                                        className={`w-3.5 h-3.5 transition-transform ${
                                                            isOpen ? 'rotate-90 text-indigo-600' : 'text-gray-400'
                                                        }`}
                                                    />
                                                    <span className="font-semibold ml-1 truncate pr-2">{row.name}</span>
                                                    <span className="pr-2 min-w-0">
                                                        <div className="text-gray-600 truncate">{row.email}</div>
                                                        <div className="text-xs text-gray-400 truncate">
                                                            {row.username || <span className="italic">Not provided</span>}
                                                        </div>
                                                    </span>
                                                    <span>
                                                        <span className="inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800">
                                                            {row.access_level_name}
                                                        </span>
                                                    </span>
                                                    <span className="inline-flex gap-3">
                                                        {user?.add_edit_user && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditClick(row);
                                                                    }}
                                                                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteClick(row);
                                                                    }}
                                                                    className="text-red-600 hover:text-red-800 hover:underline"
                                                                >
                                                                    Deactivate
                                                                </button>
                                                            </>
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Expanded detail */}
                                                {isOpen && (
                                                    <div className="p-4">
                                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm text-gray-700">
                                                            <div className="flex items-start gap-2">
                                                                <FiMapPin className="text-gray-400 mt-0.5" />
                                                                <div className="flex flex-wrap gap-1">
                                                                    {row.users_branch?.length ? row.users_branch.map((branch) => (
                                                                        <span
                                                                            key={branch.id}
                                                                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full"
                                                                        >
                                                                            {branch.branch_name}
                                                                        </span>
                                                                    )) : <span className="text-gray-400 italic">No branches</span>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {PERM_GROUPS.map(([group, perms]) => (
                                                                <div key={group} className="border border-gray-200 rounded-[10px] p-3">
                                                                    <h4 className="text-[11px] uppercase tracking-[0.06em] text-gray-500 mb-2">
                                                                        {group}
                                                                    </h4>
                                                                    {perms.map(([key, label]) => {
                                                                        const allowed = !!row[key];
                                                                        return (
                                                                            <div
                                                                                key={key}
                                                                                className={`flex items-center gap-2 py-[5px] text-[13.5px] ${
                                                                                    allowed ? 'text-gray-800' : 'text-gray-400'
                                                                                }`}
                                                                            >
                                                                                <FiCheckCircle
                                                                                    className={`flex-shrink-0 w-[15px] h-[15px] ${
                                                                                        allowed ? 'text-indigo-600' : 'text-gray-200'
                                                                                    }`}
                                                                                />
                                                                                {label}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <Pagination
                                pagination={pagination}
                                onPageChange={setCurrentPage}
                                onPerPageChange={handlePerPageChange}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onUserAdded={handleUserAdded}
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
