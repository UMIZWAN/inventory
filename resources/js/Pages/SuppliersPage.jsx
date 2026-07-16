import { useEffect, useState, useRef } from "react";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdAlternateEmail } from "react-icons/md";
import { FaMapLocationDot } from "react-icons/fa6";
import { FiPackage, FiSearch } from "react-icons/fi";
import Layout from "../components/layout/Layout";
import { useSuppliers } from "../context/SuppliersContext";
import SupplierModal from "../components/SupplierModal";
import { useAuth } from "../context/AuthContext";
import { Head } from "@inertiajs/react";

const GRID_COLS = { display: 'grid', gridTemplateColumns: '1fr 1.6fr 100px' };

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

    return (
        <Layout>
            <Head title="Suppliers" />
            <div className="py-1 px-1">
                <div className="border border-gray-200 rounded-2xl bg-white p-4 shadow-sm">
                    {/* Panel head: search + add button */}
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="relative w-full max-w-[280px]">
                            <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by name…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full min-h-[38px] pl-[30px] pr-3 text-sm bg-white border-0 border-b border-gray-200 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        {user?.settings && (
                            <button
                                onClick={handleAdd}
                                className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Add Supplier
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
                            <FiPackage className="text-4xl text-gray-300" />
                            <p className="text-lg font-medium">Loading suppliers...</p>
                        </div>
                    ) : (
                        <>
                            {/* Table head */}
                            <div
                                style={GRID_COLS}
                                className="px-3 pb-2 text-[11px] uppercase tracking-[0.08em] text-gray-500 border-b border-gray-200 mb-1"
                            >
                                <span>Name</span>
                                <span>Detail</span>
                                <span className="text-right">Actions</span>
                            </div>

                            {/* Rows */}
                            {filteredData.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
                                    <FiPackage className="text-4xl text-gray-300" />
                                    <p className="text-lg font-medium">No suppliers found</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {filteredData.map((row) => (
                                        <div
                                            key={row.id}
                                            style={GRID_COLS}
                                            className="items-center px-3 py-3.5 text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="font-semibold pr-2">{row.supplier_name}</span>
                                            <div className="py-1 space-y-1 text-gray-600 pr-2">
                                                <div className="flex items-center gap-2">
                                                    <BsFillTelephoneFill className="flex-shrink-0 text-gray-400" />
                                                    <span>{row.supplier_office_number}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MdAlternateEmail className="flex-shrink-0 text-gray-400" />
                                                    <span>{row.supplier_email}</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <FaMapLocationDot className="flex-shrink-0 text-gray-400 mt-0.5" />
                                                    <span className="whitespace-pre-line">{row.supplier_address}</span>
                                                </div>
                                            </div>
                                            <span className="text-right">
                                                {user?.settings && (
                                                    <button
                                                        onClick={() => handleEdit(row)}
                                                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
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
