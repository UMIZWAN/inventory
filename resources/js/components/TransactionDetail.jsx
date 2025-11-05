import React, { useState, useEffect } from "react";
import logo from '../assets/image/universal group - black logo.jpg';
import api from "../api/api";
import { useAssetMeta } from "../context/AssetsContext";
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet, Font, Image } from "@react-pdf/renderer";

// Register fonts (optional)
Font.register({
    family: "Roboto",
    fonts: [
        { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf", fontWeight: 400 },
        { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc9.ttf", fontWeight: 700 },
    ],
});

// PDF Document Component
const InvoicePDF = ({ transaction, getAssetDetails }) => {
    const items = transaction?.transaction_items || transaction?.assets_transaction_item_list || [];
    let totalAmount = 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Image style={styles.logo} src={logo} />
                <Text style={styles.header}>invoice</Text>

                <View style={styles.section}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                        <Text>
                            <Text style={styles.label}>Branch:</Text> {transaction?.assets_from_branch_name || transaction.from_branch.name}
                        </Text>
                        <Text style={{ width: 180, textAlign: "left" }}>
                            <Text style={styles.label}>Date:</Text>{" "}
                            {new Date(transaction?.created_at).toLocaleDateString('en-GB')}
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                        <Text style={{ marginRight: 40 }}>
                            <Text style={styles.label}>Purpose:</Text>{" "}
                            {transaction?.asset_transaction_purpose_name || transaction?.purpose.asset_transaction_purpose_name}
                        </Text>
                        <Text style={{ width: 180, textAlign: "left" }}>
                            <Text style={styles.label}>Ref. No.:</Text>{" "}
                            {transaction?.assets_transaction_running_number}
                        </Text>
                    </View>

                    {["New SA", "Insurance", "CSI", "Cash"].includes(transaction?.asset_transaction_purpose_name) && (
                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.label}>Customer Name:</Text>
                            <Text style={{ marginTop: 8 }}>{transaction.assets_recipient_name}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={{ ...styles.tableRow, ...styles.tableHeader }}>
                            {/* <Text style={styles.tableCell}>#</Text> */}
                            <Text style={styles.tableCell}>Code</Text>
                            <Text style={styles.tableCell}>Asset Name</Text>
                            <Text style={styles.tableCell}>Quantity</Text>
                            <Text style={styles.tableCell}>Price (Each)</Text>
                            <Text style={styles.tableCell}>Total Price</Text>
                        </View>

                        {/* Table Rows */}
                        {items.map((item, index) => {
                            const price = item?.assets.asset_sales_cost;
                            const quantity = item?.asset_unit;
                            const total = price * quantity;
                            totalAmount += total;

                            return (
                                <View key={index} style={styles.tableRow}>
                                    {/* <Text style={styles.tableCell}>{index + 1}</Text> */}
                                    <Text style={styles.tableCell}>{item?.assets.asset_running_number}</Text>
                                    <Text style={styles.tableCell}>{item?.asset_name}</Text>
                                    <Text style={styles.tableCell}>{quantity}</Text>
                                    <Text style={styles.tableCell}>RM {Number(price).toFixed(2)}</Text>
                                    <Text style={styles.tableCell}>RM {Number(total).toFixed(2)}</Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Total Amount */}
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalText}>Total Amount: RM {totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.label}>Remark: {transaction?.assets_transaction_remark || '-'}</Text>
                    </View>
                </View>

                <View style={styles.signatureRow}>
                    <View style={styles.issuedBlock}>
                        <Text style={{ marginBottom: 10, textTransform: "capitalize" }}>
                            <Text>Issued by</Text> {transaction?.created_by_name || transaction?.created_by.name}
                        </Text>
                        <Text>
                            <Text>{transaction?.assets_from_branch_name || transaction?.from_branch.name}</Text>
                        </Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text style={{ marginBottom: 30 }}>Receiver's Signature:</Text>
                        <Text>___________________________</Text>
                        <Text>Name:</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

// Main Component
function TransactionDetail({ transaction, onClose, type = "transfer" }) {

    const { fetchAssetTransaction } = useAssetMeta();
    const [balanceUnits, setBalanceUnits] = useState({});

    useEffect(() => {
        const initialBalances = 0;
        // getItemList.forEach((item, idx) => {
        //     initialBalances[idx] = item.balance_unit || item.asset_unit; // fallback
        // });
        setBalanceUnits(initialBalances);
    }, [transaction]);

    const handleBalanceChange = (index, value) => {
        const updated = { ...balanceUnits, [index]: Number(value) };
        setBalanceUnits(updated);
    };

    const getItemList = transaction.assets_transaction_item_list || transaction.transaction_items || [];
    let totalAmount = 0;

    // const totalAmount = (transaction.assets_transaction_item_list).reduce((sum, item) => {
    //     console.log(item, sum)
    //     const price = item?.assets.asset_sales_cost || 0
    //     const quantity = (item.asset_unit || 1);
    //     return sum + price * quantity;
    // }, 0);

    const completeTransaction = async (txnId = transaction.id, balanceUnits, remark = '', status = 'COMPLETED') => {
        try {
            const formattedItems = getItemList.map((item, index) => ({
                asset_id: item.asset_id,
                asset_unit: balanceUnits[index] ?? item.asset_unit,
                status: "", // optional
            }));

            const response = await api.put(`/api/assets-transaction/${txnId}`, {
                assets_transaction_item_list: formattedItems,
                assets_transaction_status: status,
                assets_transaction_remark: remark,
            });

            fetchAssetTransaction();
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Unknown error" };
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl w-full relative">
                <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-black text-2xl">
                    &times;
                </button>

                <div className="flex justify-between items-center m-4">
                    <h2 className="text-2xl font-bold">{type === "receive" ? "Receive Details" : "Transaction Invoice"}</h2>
                    {type === "transfer" && (
                        <PDFDownloadLink
                            document={
                                <InvoicePDF
                                    transaction={transaction}

                                    type={type}
                                />
                            }
                            fileName={`${type === "receive" ? "Receive" : "Invoice"}_${transaction.assets_transaction_running_number}.pdf`}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm mr-6"
                        >
                            {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
                        </PDFDownloadLink>
                    )}
                </div>

                <div className="bg-white p-4">
                    <div className="flex justify-between mb-4 mr-8">
                        <div className="mb-6 space-y-1">
                            <p><strong>Branch:</strong> {transaction.assets_from_branch_name || transaction.from_branch.name}</p>

                            {type === "transfer" && (
                                <>
                                    <p><strong>Purpose:</strong> {transaction.asset_transaction_purpose_name || transaction.purpose.asset_transaction_purpose_name}</p>
                                </>
                            )}

                            {type === "receive" && (
                                <>
                                    <p><strong>Supplier:</strong> {transaction.supplier_name}</p>
                                </>
                            )}

                            {["New SA", "Insurance", "CSI", "Cash", "CASH"].includes(transaction.asset_transaction_purpose_name) && (
                                <div className="mb-2">
                                    <p>
                                        <strong>Customer Name:</strong> {transaction.assets_recipient_name}
                                    </p>
                                </div>
                            )}

                        </div>
                        <div className="mb-6 space-y-1">

                            {type === "transfer" && (
                                <>
                                    {transaction.assets_transaction_purpose &&
                                        JSON.parse(transaction.assets_transaction_purpose).includes("SELL") && (
                                            <p><strong>Recipient:</strong> {transaction.assets_recipient_name}</p>
                                        )}
                                    <p><strong>Date Issued:</strong> {new Date(transaction.created_at).toLocaleDateString()}</p>
                                </>
                            )}

                            {type === "receive" && (
                                <>
                                    <p><strong>Received Date:</strong> {new Date(transaction.received_at).toLocaleDateString()}</p>
                                </>
                            )}

                            <p><strong>Reference Number:</strong> {transaction.assets_transaction_running_number}</p>


                        </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-2">Item List</h3>
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border">Code</th>
                                <th className="px-4 text-left py-2 border">Asset Name</th>
                                <th className="px-4 py-2 border">Quantity</th>
                                {transaction.assets_transaction_status === "IN PROGRESS" && (
                                    <th className="px-4 py-2 border">Balance Unit</th>
                                )}
                                <th className="px-4 py-2 border">Price</th>
                                <th className="px-4 py-2 border">Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getItemList.map((item, index) => {
                                // const id = item.asset_id;
                                const price = item?.assets.asset_sales_cost || transaction?.asset_sales_cost || 0;
                                const quantity = item?.asset_unit
                                const total = price * quantity;
                                totalAmount += total;

                                return (
                                    <tr key={index}>
                                        <td className="px-4 py-2 border text-center">{item?.assets.asset_running_number}</td>
                                        <td className="px-4 py-2 border w-60">{item?.asset_name}</td>
                                        <td className="px-4 py-2 border text-center">{quantity}</td>
                                        {transaction.assets_transaction_status === "IN PROGRESS" && (
                                            <td className="px-4 py-2 border text-center">
                                                <input
                                                    type="number"
                                                    value={balanceUnits[index]}
                                                    onChange={(e) => handleBalanceChange(index, e.target.value)}
                                                    className="w-16 border rounded px-1 py-0.5 text-center"
                                                />
                                            </td>
                                        )}
                                        <td className="px-4 py-2 border text-center">RM {Number(price).toFixed(2)}</td>
                                        <td className="px-4 py-2 border text-center">RM {Number(total).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="flex justify-end mt-4">
                        <p className="text-lg font-bold">Total Amount: RM {totalAmount.toFixed(2)}</p>
                    </div>

                    <div className="mt-4">
                        <p><strong>Remark:</strong> {transaction.assets_transaction_remark || "-"}</p>
                    </div>

                    {type === "transfer" && (
                        <div className="mt-4">
                            <p>
                                <strong>Attachment:</strong>{" "}
                                {transaction.attachment ? (
                                    <a
                                        href={`http://127.0.0.1:8000/${transaction.attachment}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline hover:text-blue-800"
                                    >
                                        View File
                                    </a>
                                ) : (
                                    "-"
                                )}
                            </p>
                        </div>
                    )}

                    {transaction.assets_transaction_status === "IN PROGRESS" && (
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={async () => {
                                    try {
                                        await completeTransaction(transaction.id, balanceUnits);
                                        alert("Transaction completed successfully."); // or trigger a refresh / close
                                        onClose(); // optionally close modal
                                    } catch (err) {
                                        alert("Failed to complete transaction: " + err.message);
                                    }
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            >
                                Complete Transaction
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}


// Define styles for the PDF
const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
    logo: { width: 250, height: 26, marginBottom: 25, alignSelf: "center" },
    header: { fontSize: 16, marginBottom: 20, textAlign: "center", textTransform: "uppercase", fontWeight: "bold" },
    section: { marginBottom: 10 },
    label: { fontWeight: "bold" },
    table: {
        width: "100%",
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    tableHeader: {
        backgroundColor: "#f3f4f6",
        fontWeight: "bold",
    },
    tableCell: {
        padding: 8,
        fontSize: 11,
        flex: 1,
        textAlign: "center",
    },
    totalContainer: {
        marginTop: 20,
        textAlign: "right",
    },
    totalText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    signatureRow: {
        flexDirection: "row",
        marginTop: 30,
        justifyContent: "space-between",
    },
    issuedBlock: {
        width: "45%",
        fontStyle: "italic",
    },
    signatureBlock: { width: "45%" },
});

export default TransactionDetail;
