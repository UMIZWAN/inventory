import { useState, useEffect, useCallback, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { FaUserShield } from "react-icons/fa6";
import { FiChevronRight, FiArrowUp, FiArrowDown, FiSearch, FiCheckCircle } from "react-icons/fi";
import api from '../../api/api';
import Layout from '../../components/layout/Layout';
import AddAccessLevelModal from './AddAccessLevelModal';
import EditAccessLevelModal from './EditAccessLevelModal';
import { useAuth } from '../../context/AuthContext';

const PERM_GROUPS = [
    ['Roles', [['view_role', 'View Role'], ['add_edit_role', 'Add/Edit Role']]],
    ['Users', [['view_user', 'View User'], ['add_edit_user', 'Add/Edit User']]],
    ['Assets', [['view_asset', 'View Asset'], ['view_asset_masterlist', 'View Asset Masterlist'], ['add_edit_asset', 'Add/Edit Asset']]],
    ['Branches', [['view_branch', 'View Branch'], ['add_edit_branch', 'Add/Edit Branch']]],
    ['Transactions', [['view_transaction', 'View Transaction'], ['add_edit_transaction', 'Add/Edit Transaction'], ['receive_transaction', 'Receive Transaction'], ['approve_reject_transaction', 'Approve/Reject Transaction']]],
    ['Reports', [['view_reports', 'View Reports'], ['download_reports', 'Download Reports']]],
    ['General', [['settings', 'Settings']]],
];

const GRID_COLS = { display: 'grid', gridTemplateColumns: '32px 1fr 110px 80px 90px' };

const AccessLevelsPage = ({ auth }) => {
    const { user } = useAuth();
    const [accessLevels, setAccessLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [accessLevelToEdit, setAccessLevelToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [expandedIds, setExpandedIds] = useState(new Set());

    const debounceTimer = useRef(null);
    const isInitialMount = useRef(true);

    const fetchAccessLevels = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/api/access-levels');
            if (response.data.success) {
                setAccessLevels(response.data.data);
                setFilteredData(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch access levels');
            }
        } catch (error) {
            console.error('Error fetching access levels:', error);
            setError('An error occurred while fetching access levels');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccessLevels();
    }, [fetchAccessLevels]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            setFilteredData(accessLevels);
            return;
        }
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            const filtered = accessLevels.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredData(filtered);
        }, 300);
        return () => clearTimeout(debounceTimer.current);
    }, [searchTerm, accessLevels]);

    const handleAccessLevelAdded = useCallback((newAccessLevel) => {
        setAccessLevels(prev => [...prev, newAccessLevel]);
    }, []);

    const handleEditClick = useCallback((accessLevel) => {
        setAccessLevelToEdit(accessLevel);
        setIsEditModalOpen(true);
    }, []);

    const handleAccessLevelUpdated = useCallback((updatedAccessLevel) => {
        setAccessLevels(prev =>
            prev.map(item =>
                item.id === updatedAccessLevel.id ? { ...item, ...updatedAccessLevel } : item
            )
        );
    }, []);

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

    // Client-side reorder only (display order is not persisted to the server)
    const moveRow = (row, direction) => {
        setAccessLevels(prev => {
            const i = prev.findIndex(item => item.id === row.id);
            const j = direction === 'up' ? i - 1 : i + 1;
            if (i < 0 || j < 0 || j >= prev.length) return prev;
            const next = [...prev];
            [next[i], next[j]] = [next[j], next[i]];
            return next;
        });
    };

    return (
        <Layout>
            <Head title="Access Levels" />
            <div className="py-1 px-1">
                <div className="border border-gray-200 rounded-2xl bg-white p-4 shadow-sm">
                    {/* Panel head: search + add button */}
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="relative w-full max-w-[340px]">
                            <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search access by name…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full min-h-[38px] pl-[30px] pr-3 text-sm bg-white border-0 border-b border-gray-200 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        {user?.add_edit_role && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Add Access Level
                            </button>
                        )}
                    </div>

                    {error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
                            <FaUserShield className="text-4xl text-gray-300" />
                            <p className="text-lg font-medium">Loading access levels...</p>
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
                                <span>User Count</span>
                                <span>Sort</span>
                                <span>Actions</span>
                            </div>

                            {/* Rows */}
                            {filteredData.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
                                    <FaUserShield className="text-4xl text-gray-300" />
                                    <p className="text-lg font-medium">No access levels found</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {filteredData.map((row, i) => {
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
                                                    <span className="font-semibold ml-1">{row.name}</span>
                                                    <span>{row.users_count ?? 0}</span>
                                                    <span className="inline-flex gap-1">
                                                        <button
                                                            disabled={i === 0}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                moveRow(row, 'up');
                                                            }}
                                                            className="inline-flex items-center justify-center w-5 h-5 border border-gray-200 rounded-md bg-white text-gray-500 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-40 disabled:pointer-events-none"
                                                        >
                                                            <FiArrowUp className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            disabled={i === filteredData.length - 1}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                moveRow(row, 'down');
                                                            }}
                                                            className="inline-flex items-center justify-center w-5 h-5 border border-gray-200 rounded-md bg-white text-gray-500 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-40 disabled:pointer-events-none"
                                                        >
                                                            <FiArrowDown className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                    <span>
                                                        {user?.add_edit_role && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditClick(row);
                                                                }}
                                                                className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Expanded detail: permission groups */}
                                                {isOpen && (
                                                    <div className="p-4">
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
                        </>
                    )}
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
