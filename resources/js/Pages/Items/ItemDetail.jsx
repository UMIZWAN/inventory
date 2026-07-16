import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '../../components/layout/Layout';
import ItemDetails from '../../components/ItemDetails';
import ItemReport from '../../components/ItemReport';
import { useAuth } from '../../context/AuthContext';
import { useAssetMeta } from '../../context/AssetsContext';
import api from '../../api/api';

const ItemDetail = ({ id }) => {
    const { selectedBranch } = useAuth();
    const { fetchCategories } = useAssetMeta();
    const [asset, setAsset] = useState(null);
    const [error, setError] = useState(null);
    const startInEdit = new URLSearchParams(window.location.search).get('edit') === '1';

    const fetchAsset = async () => {
        try {
            const res = await api.get(`/api/assets/${id}`);
            setAsset(res.data?.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load asset.');
        }
    };

    useEffect(() => {
        fetchAsset();
        fetchCategories();
    }, [id]);

    const goBack = () => router.visit('/items/item-list');

    return (
        <Layout>
            <Head title="Item Details" />

            {error && (
                <div className="bg-white rounded-2xl shadow p-6">
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <button onClick={goBack} className="text-sm text-blue-600 hover:underline">
                        &larr; Back to Stock List
                    </button>
                </div>
            )}

            {!error && !asset && (
                <div className="bg-white rounded-2xl shadow p-6 text-sm text-gray-500">
                    Loading asset...
                </div>
            )}

            {!error && asset && (
                <div className="flex flex-col xl:flex-row gap-4 items-start">
                    <div className="w-full xl:w-2/5 min-w-0">
                        <ItemDetails
                            asPage
                            asset={asset}
                            startInEdit={startInEdit}
                            onClose={goBack}
                            onUpdated={(updated) => {
                                if (updated) {
                                    setAsset(updated);
                                } else {
                                    fetchAsset();
                                }
                            }}
                        />
                    </div>
                    <div className="w-full xl:w-3/5 min-w-0">
                        <ItemReport id={asset.id} branchId={selectedBranch?.branch_id} />
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ItemDetail;
