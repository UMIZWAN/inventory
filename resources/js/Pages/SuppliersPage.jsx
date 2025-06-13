import { useEffect, useState } from "react";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdAlternateEmail } from "react-icons/md";
import { FaMapLocationDot } from "react-icons/fa6";
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
            <div className="p-4">
                <Head title="Suppliers" />
                <div className="max-w-9xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Suppliers</h1>
                        {user?.settings && (
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={handleAdd}
                            >
                                Add Supplier
                            </button>
                        )}
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="overflow-x-auto">
                                {loading ? (
                                    <p>Loading...</p>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Detail</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {suppliers.map((s) => (
                                                <tr key={s.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">{s.supplier_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        <div>
                                                            <div className="flex items-stretch gap-2 text-sm text-gray-700">
                                                                <BsFillTelephoneFill className="self-center" />
                                                                {s.supplier_office_number}
                                                            </div>
                                                            <div className="flex items-stretch gap-2 text-sm text-gray-700">
                                                                <MdAlternateEmail className="self-center" />
                                                                {s.supplier_email}
                                                            </div>
                                                            <div className="flex items-stretch gap-2 text-sm text-gray-700">
                                                                <FaMapLocationDot className="self-center" />
                                                                {s.supplier_address}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                                                    {user?.settings && (
                                                        <button
                                                            className="text-blue-600 hover:underline"
                                                            onClick={() => handleEdit(s)}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                    <SupplierModal
                        open={showModal}
                        onClose={() => setShowModal(false)}
                        initialData={selectedSupplier}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default SuppliersPage;
