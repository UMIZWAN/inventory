import { useEffect, useState, useRef } from "react";
import DataTable from 'react-data-table-component';
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdAlternateEmail } from "react-icons/md";
import { FaMapLocationDot } from "react-icons/fa6";
import { FiPackage } from "react-icons/fi";
import Layout from "../components/layout/Layout";
import { useSuppliers } from "../context/SuppliersContext";
import SupplierModal from "../components/SupplierModal";
import { useAuth } from "../context/AuthContext";
import { Head } from "@inertiajs/react";

const SuppliersPage = () => {
    const { user } = useAuth();
    const { fetchSuppliers, suppliers, loading } = useSuppliers();
    const [showModal, setShowModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    const debounceTimer = useRef(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        setFilteredData(suppliers);
    }, [suppliers]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            const filtered = suppliers.filter(item =>
                item.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredData(filtered);
        }, 300);
        return () => clearTimeout(debounceTimer.current);
    }, [searchTerm, suppliers]);

    const handleAdd = () => {
        setSelectedSupplier(null);
        setShowModal(true);
    };

    const handleEdit = (supplier) => {
        setSelectedSupplier(supplier);
        setShowModal(true);
    };

    const columns = [
        {
            name: 'Name',
            selector: row => row.supplier_name,
            sortable: true,
        },
        {
            name: 'Detail',
            cell: (row) => (
                <div className="py-2">
                    <div className="flex items-stretch gap-2 text-sm text-gray-700">
                        <BsFillTelephoneFill className="self-center" />
                        {row.supplier_office_number}
                    </div>
                    <div className="flex items-stretch gap-2 text-sm text-gray-700">
                        <MdAlternateEmail className="self-center" />
                        {row.supplier_email}
                    </div>
                    <div className="flex items-stretch gap-2 text-sm text-gray-700">
                        <FaMapLocationDot className="self-start mt-1" />
                        <span className="whitespace-pre-line">{row.supplier_address}</span>
                    </div>
                </div>
            ),
            grow: 2,
        },
        ...(user?.settings ? [{
            name: 'Actions',
            center: true,
            cell: (row) => (
                <button
                    onClick={() => handleEdit(row)}
                    className="text-indigo-600 hover:text-indigo-900"
                >
                    Edit
                </button>
            ),
        }] : []),
    ];

    const LoadingComponent = () => (
        <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
            <FiPackage className="text-4xl text-gray-300" />
            <p className="text-lg font-medium">Loading suppliers...</p>
        </div>
    );

    const NoDataComponent = () => (
        <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
            <FiPackage className="text-4xl text-gray-300" />
            <p className="text-lg font-medium">No suppliers found</p>
            <p className="text-sm">Try adjusting your search criteria.</p>
        </div>
    );

    return (
        <Layout>
            <Head title="Suppliers" />
            <div className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Suppliers</h1>
                    {user?.settings && (
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={handleAdd}
                        >
                            Add Supplier
                        </button>
                    )}
                </div>

                <div className="bg-white shadow-md rounded-lg p-4">
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
                        highlightOnHover
                        striped
                        noDataComponent={<NoDataComponent />}
                    />
                </div>

                <SupplierModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    initialData={selectedSupplier}
                />
            </div>
        </Layout>
    );
};

export default SuppliersPage;
