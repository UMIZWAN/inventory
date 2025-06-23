import React, { useState } from 'react';
import api from '../api/api'; // adjust path as needed
import Layout from '../components/layout/Layout';

const ImportAssets = () => {
    const [csvFile, setCsvFile] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setCsvFile(e.target.files[0]);
        setResults([]);
        setMessage('');
    };

    const handleUpload = async () => {
        if (!csvFile) return alert('Please select a CSV file.');

        const formData = new FormData();
        formData.append('csv_file', csvFile);

        try {
            setLoading(true);
            const res = await api.post('/api/assets/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResults(res.data.results || []);
            setMessage(res.data.message || 'Import complete');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-xl mt-8">
                <h2 className="text-xl font-semibold mb-4">Import Assets CSV</h2>
                <h3 className="text-md font-semibold mb-4">Make sure to have header in CSV file.(name, asset_running_number, asset_type, asset_category, asset_stable_unit, asset_purchase_cost, asset_sales_cost, asset_unit_measure, asset_branch, asset_current_unit, asset_description)</h3>

                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mb-4 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />

                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Uploading...' : 'Upload CSV'}
                </button>

                {message && (
                    <div className="mt-4 text-sm text-gray-700">{message}</div>
                )}

                {results.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-md font-semibold mb-2">Results</h3>
                        <div className="space-y-2 max-h-64 overflow-auto border rounded p-2 text-sm">
                            {results.map((r, i) => (
                                <div
                                    key={i}
                                    className={`p-2 rounded border ${r.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                                        }`}
                                >
                                    <p>
                                        <strong>{r.row.name || '[No Name]'}</strong> -{' '}
                                        {r.success ? '✅ Imported' : '❌ Failed'}
                                    </p>
                                    {!r.success && (
                                        <ul className="list-disc list-inside text-red-600">
                                            {typeof r.errors === 'object'
                                                ? Object.values(r.errors).flat().map((e, j) => <li key={j}>{e}</li>)
                                                : <li>{r.errors}</li>}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ImportAssets;
