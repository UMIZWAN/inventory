import React, { useState } from 'react';
import api from '../api/api';
import Layout from '../components/layout/Layout';

const SupplierForm = () => {
    const [form, setForm] = useState({
        name: '',
        brn: '',
        tin: '',
        sst: '',
        email: '',
        address: '',
        terms: 'Net 30',
        taxDocType: '',
        contact: '',
        tel: '',
        fax: '',
    });

    const termsOptions = ['Net 30', 'Net 60', 'COD'];
    const taxDocOptions = ['Invoice', 'Credit Note', 'Debit Note'];

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg('');
        setErrorMsg('');

        try {
            await api.post('/api/suppliers', form);
            setSuccessMsg('Supplier added successfully!');
            setForm({
                name: '', brn: '', tin: '', sst: '', email: '', address: '',
                terms: 'Net 30', taxDocType: '', contact: '', tel: '', fax: ''
            });
        } catch (err) {
            setErrorMsg('Failed to add supplier.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
                <h2 className="text-2xl font-bold mb-6">Add New Supplier</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-medium">Vendor Name</label>
                        <input name="name" value={form.name} onChange={handleChange} required
                            className="w-full border rounded px-3 py-2" />
                    </div>

                    <div>
                        <label className="block font-medium">Terms</label>
                        <select name="terms" value={form.terms} onChange={handleChange}
                            className="w-full border rounded px-3 py-2">
                            {termsOptions.map(term => (
                                <option key={term} value={term}>{term}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium">BRN</label>
                        <input name="brn" value={form.brn} onChange={handleChange}
                            className="w-full border rounded px-3 py-2" />
                    </div>

                    <div>
                        <label className="block font-medium">Tax Doc Type</label>
                        <select name="taxDocType" value={form.taxDocType} onChange={handleChange}
                            className="w-full border rounded px-3 py-2">
                            <option value="">-- Select --</option>
                            {taxDocOptions.map(doc => (
                                <option key={doc} value={doc}>{doc}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium">TIN</label>
                        <input name="tin" value={form.tin} onChange={handleChange}
                            className="w-full border rounded px-3 py-2" />
                    </div>

                    <div>
                        <label className="block font-medium">SST Reg No</label>
                        <input name="sst" value={form.sst} onChange={handleChange}
                            className="w-full border rounded px-3 py-2" />
                    </div>

                    <div>
                        <label className="block font-medium">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange}
                            className="w-full border rounded px-3 py-2" />
                    </div>

                    <div>
                        <label className="block font-medium">Address</label>
                        <textarea name="address" value={form.address} onChange={handleChange}
                            className="w-full border rounded px-3 py-2" />
                    </div>

                    <div>
                        <label className="block font-medium">Contact Person</label>
                        <input name="contact" value={form.contact} onChange={handleChange}
                            className="w-full border rounded px-3 py-2" />
                    </div>

                    <div>
                        <label className="block font-medium">Tel</label>
                        <input name="tel" value={form.tel} onChange={handleChange}
                            className="w-full border rounded px-3 py-2" />
                    </div>

                    <div>
                        <label className="block font-medium">Fax</label>
                        <input name="fax" value={form.fax} onChange={handleChange}
                            className="w-full border rounded px-3 py-2" />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-3">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            disabled={loading}>
                            {loading ? 'Saving...' : 'Add Supplier'}
                        </button>
                        {successMsg && <span className="text-green-600">{successMsg}</span>}
                        {errorMsg && <span className="text-red-600">{errorMsg}</span>}
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default SupplierForm;
