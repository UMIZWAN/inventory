import { useState } from "react";
import Layout from "../components/layout/Layout";
import { useSuppliers } from "../context/SuppliersContext";
import AddSupplierModal from "../components/AddSupplierModal";

const SuppliersPage = () => {
    const { suppliers, loading } = useSuppliers();
    const [openModal, setOpenModal] = useState(false);

    return (
        <Layout>
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Suppliers</h1>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={() => setOpenModal(true)}
                    >
                        Add Supplier
                    </button>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="min-w-full table-auto border">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 border">Name</th>
                                <th className="px-4 py-2 border">Office</th>
                                <th className="px-4 py-2 border">Email</th>
                                <th className="px-4 py-2 border">Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((s) => (
                                <tr key={s.id} className="border-t">
                                    <td className="px-4 py-2 border">{s.supplier_name}</td>
                                    <td className="px-4 py-2 border">{s.supplier_office_number}</td>
                                    <td className="px-4 py-2 border">{s.supplier_email}</td>
                                    <td className="px-4 py-2 border whitespace-pre-wrap">{s.supplier_address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <AddSupplierModal open={openModal} onClose={() => setOpenModal(false)} />
            </div>
        </Layout>
    );
};

export default SuppliersPage;
