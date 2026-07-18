import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { FiUpload, FiDownload } from 'react-icons/fi';
import api from '../api/api';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';

const TEMPLATE_HEADERS = [
    'name',
    'asset_running_number',
    'asset_type',
    'asset_category',
    'asset_stable_unit',
    'asset_purchase_cost',
    'asset_sales_cost',
    'asset_unit_measure',
    'asset_branch',
    'asset_current_unit',
    'asset_description',
];

const REQUIRED_FIELDS = ['name', 'asset_running_number', 'asset_category', 'asset_stable_unit', 'asset_unit_measure', 'asset_branch', 'asset_current_unit'];

const ImportAssets = () => {
    const { user } = useAuth();
    const [csvFile, setCsvFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [errors, setErrors] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (user?.email !== 'dayangnh95@gmail.com' && user?.email !== 'umwongsw@gmail.com' && user?.email !== 'nafiqahcyindy@gmail.com') {
        return (
            <Layout>
                <div className="py-1 px-1">
                    <div className="border border-gray-200 rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-red-600 font-semibold text-sm">You do not have permission to access this page.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    const parseCSV = (text) => {
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length === 0) return { headers: [], rows: [] };

        const hdrs = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row = {};
            hdrs.forEach((h, i) => { row[h] = values[i] || ''; });
            return row;
        });

        return { headers: hdrs, rows };
    };

    const validateRows = (rows) => {
        const rowErrors = [];
        rows.forEach((row, idx) => {
            const missing = REQUIRED_FIELDS.filter(f => !row[f] || row[f].trim() === '');
            if (missing.length > 0) {
                rowErrors.push({ row: idx + 1, fields: missing });
            }
        });
        return rowErrors;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setCsvFile(file);
        setResults([]);
        setMessage('');
        setPreview([]);
        setHeaders([]);
        setErrors([]);

        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const { headers: hdrs, rows } = parseCSV(evt.target.result);
                setHeaders(hdrs);
                setPreview(rows);
                setErrors(validateRows(rows));
            };
            reader.readAsText(file);
        }
    };

    const handleUpload = async () => {
        if (!csvFile) return alert('Please select a CSV file.');
        if (errors.length > 0) return alert('Please fix the errors before importing.');

        const formData = new FormData();
        formData.append('csv_file', csvFile);

        try {
            setLoading(true);
            const res = await api.post('/api/assets/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResults(res.data.results || []);
            setMessage(res.data.message || 'Import complete');
            setPreview([]);
            setErrors([]);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const sampleRows = [
            'Marker Pen Red,MKR-001,Stationery,Office Supplies,100,1.50,3.00,PCS,HQ,50,Red marker pen for whiteboard',
            'A4 Paper 80gsm,A4P-002,Paper,Office Supplies,500,12.00,18.00,REAM,HQ,200,Standard A4 paper',
            'Binder Clip 32mm,BDC-003,Clip,Office Supplies,200,3.50,6.00,BOX,HQ,80,Large binder clips',
        ];
        const csv = TEMPLATE_HEADERS.join(',') + '\n' + sampleRows.join('\n') + '\n';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'assets_import_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const errorRowSet = new Set(errors.map(e => e.row));
    const errorFieldMap = {};
    errors.forEach(e => { errorFieldMap[e.row] = new Set(e.fields); });

    return (
        <Layout>
            <Head title="Import CSV" />
            <div className="py-1 px-1">
                <div className="border border-gray-200 rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <h2 className="text-sm font-semibold text-gray-800">Import Assets CSV</h2>
                        <button
                            onClick={downloadTemplate}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                        >
                            <FiDownload className="w-3.5 h-3.5" />
                            Download Template
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 mb-2">
                        Required fields: <span className="font-medium text-gray-700">{REQUIRED_FIELDS.join(', ')}</span>
                    </p>

                    <p className="text-sm text-gray-500 mb-4">
                        New stock (quantity &gt; 0) creates a stock-in transaction record. Items that already hold stock are amended instead.
                    </p>

                    <label className="flex items-center gap-3 mb-4 px-3 py-3 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
                        <FiUpload className="flex-shrink-0 w-5 h-5 text-gray-400" />
                        <div className="text-sm">
                            <span className="text-indigo-600 font-medium">Choose a CSV file</span>
                            <span className="text-gray-500"> or drag it here</span>
                            {csvFile && <div className="text-xs text-gray-500 mt-0.5">{csvFile.name}</div>}
                        </div>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>

                    {/* CSV Preview Table */}
                    {preview.length > 0 && (
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-[11px] uppercase tracking-[0.08em] text-gray-500">
                                    Preview ({preview.length} rows)
                                    {errors.length > 0 && (
                                        <span className="text-red-600 ml-2 font-normal normal-case tracking-normal">
                                            — {errors.length} row(s) with errors
                                        </span>
                                    )}
                                </h3>
                            </div>
                            <div className="overflow-auto max-h-96 border border-gray-200 rounded-xl">
                                <table className="min-w-full text-xs text-left">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 border-b border-gray-200 text-gray-500 font-medium">#</th>
                                            {headers.map((h, i) => (
                                                <th key={i} className={`px-3 py-2 border-b border-gray-200 font-medium ${REQUIRED_FIELDS.includes(h) ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {h}
                                                    {REQUIRED_FIELDS.includes(h) && <span className="text-red-500">*</span>}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.map((row, idx) => {
                                            const rowNum = idx + 1;
                                            const hasError = errorRowSet.has(rowNum);
                                            const badFields = errorFieldMap[rowNum] || new Set();
                                            return (
                                                <tr key={idx} className={hasError ? 'bg-red-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-3 py-1.5 border-b border-gray-100 text-gray-400">{rowNum}</td>
                                                    {headers.map((h, i) => (
                                                        <td
                                                            key={i}
                                                            className={`px-3 py-1.5 border-b border-gray-100 ${badFields.has(h) ? 'text-red-600 font-semibold bg-red-100' : 'text-gray-700'}`}
                                                        >
                                                            {row[h] || (badFields.has(h) ? 'MISSING' : '—')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={loading || errors.length > 0}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Upload CSV'}
                    </button>

                    {errors.length > 0 && (
                        <p className="text-red-600 text-sm mt-2">Fix the highlighted errors before importing.</p>
                    )}

                    {message && (
                        <div className="mt-4 text-sm text-gray-700">{message}</div>
                    )}

                    {results.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-[11px] uppercase tracking-[0.08em] text-gray-500 mb-2">Results</h3>
                            <div className="space-y-2 max-h-64 overflow-auto border border-gray-200 rounded-xl p-2 text-sm">
                                {results.map((r, i) => (
                                    <div
                                        key={i}
                                        className={`p-2 rounded-lg border ${r.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                                    >
                                        <p>
                                            <strong>{r.row.name || '[No Name]'}</strong> —{' '}
                                            {r.success ? 'Imported' : 'Failed'}
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
            </div>
        </Layout>
    );
};

export default ImportAssets;
