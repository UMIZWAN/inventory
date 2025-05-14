import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { useSuppliers } from "../context/SuppliersContext";
import SupplierModal from "../components/SupplierModal";
import { useAuth } from "../context/AuthContext";
import { Head } from "@inertiajs/react";

const SuppliersPage = () => {
    const { user } = useAuth();
    const { fetchSuppliers, suppliers, loading } = useSuppliers();
    const [openModal, setOpenModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleAdd = () => {
        setSelectedSupplier(null);
        setShowModal(true);
    };

    // For Edit
    const handleEdit = (supplier) => {
        setSelectedSupplier(supplier);
        setShowModal(true);
    };

    return (
        <Layout>
            <Head title="Suppliers" />
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Suppliers</h1>
                    {user?.add_edit_supplier && (
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                            onClick={handleAdd}
                        >
                            Add Supplier
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Office</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {suppliers.map((s) => (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.supplier_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.supplier_office_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.supplier_email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.supplier_address}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                                                <button
                                                    className="text-blue-600 hover:underline"
                                                    onClick={() => handleEdit(s)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
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
