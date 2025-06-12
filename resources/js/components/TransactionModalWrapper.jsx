import React, { useEffect, useState } from 'react';
import TransferDetailModal from './TransferDetailModal';
import TransactionDetail from './TransactionDetail';
import api from '../api/api';

export default function TransactionModalWrapper({ id, isOpen, onClose }) {

    const [data, setData] = useState(null);
    const [type, setType] = useState("");

    useEffect(() => {
        if (id && isOpen) {
            api.get(`/api/assets-transaction/${id}`)
                .then(res => {
                    setData(res.data.data);
                    const t = res.data.data.assets_transaction_type;
                    setType(
                        t === "ASSET TRANSFER"
                            ? "asset transfer"
                            : t === "ASSET IN"
                                ? "receive"
                                : "transfer"
                    );
                })
                .catch(err => {
                    console.error("Failed to load transaction", err);
                });
        }
    }, [id, isOpen]);

    if (!data) return null;

    return type === "asset transfer" ? (
        <TransferDetailModal
            isOpen={isOpen}
            onClose={onClose}
            data={data}
            mode="view"
        />
    ) : (
        <TransactionDetail
            transaction={data}
            onClose={onClose}
            type={type} // "receive"
        />
    );
}
