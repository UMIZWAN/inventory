import { useState, useEffect, useCallback, useRef } from 'react';
import { Head } from '@inertiajs/react';
import DataTable from 'react-data-table-component';
import { FaUserShield } from "react-icons/fa6";
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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [accessLevelToEdit, setAccessLevelToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);

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
                item.id === updatedAccessLevel.id ? updatedAccessLevel : item
            )
        );
    }, []);

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
    }, []);

    const columns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        ...(user?.add_edit_role ? [{
            name: 'Actions',
            center: true,
            cell: (row) => (
                <button
                    onClick={() => handleEditClick(row)}
                    className="text-indigo-600 hover:text-indigo-900"
                >
                    Edit
                </button>
            ),
        }] : []),
    ];

    const ExpandedComponent = ({ data }) => (
        <div className="py-4 px-2 bg-gray-50" style={{ maxWidth: '100%', overflow: 'hidden' }}>
            <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-bold text-lg mb-3">Access Level Details: {data.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <FaUserShield className="text-4xl text-gray-300" />
            <p className="text-lg font-medium">Loading access levels...</p>
        </div>
    );

    const NoDataComponent = () => (
        <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
            <FaUserShield className="text-4xl text-gray-300" />
            <p className="text-lg font-medium">No access levels found</p>
            <p className="text-sm">Try adjusting your search criteria.</p>
        </div>
    );

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
                            {error ? (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search by name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="px-3 py-1.5 text-sm rounded-full border border-gray-300 w-full sm:w-1/3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <DataTable
                                        columns={columns}
                                        data={filteredData}
                                        progressPending={loading}
                                        progressComponent={<LoadingComponent />}
                                        pagination
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
