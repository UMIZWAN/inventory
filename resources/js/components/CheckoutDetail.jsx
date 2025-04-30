import React from "react";
import { useAssetMeta } from "../context/AssetsContext";
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";

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

    let totalAmount = 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Transaction Invoice</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Reference Number:</Text>
                    <Text style={styles.value}>{transaction.assets_transaction_running_number}</Text>

                    <Text style={styles.label}>Branch:</Text>
                    <Text style={styles.value}>{transaction.assets_to_branch_name}</Text>

                    <Text style={styles.label}>Purpose:</Text>
                    <Text style={styles.value}>
                        {transaction.assets_transaction_purpose ? JSON.parse(transaction.assets_transaction_purpose).join(", ") : "-"}
                    </Text>

                    <Text style={styles.label}>Type:</Text>
                    <Text style={styles.value}>{transaction.assets_transaction_type}</Text>

                    <Text style={styles.label}>Created By:</Text>
                    <Text style={styles.value}>{transaction.created_by_name}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={{ ...styles.label, marginBottom: 10 }}>Item List</Text>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={{ ...styles.tableRow, ...styles.tableHeader }}>
                            <Text style={styles.tableCell}>#</Text>
                            <Text style={styles.tableCell}>Asset Name</Text>
                            <Text style={styles.tableCell}>Quantity</Text>
                            <Text style={styles.tableCell}>Price (Each)</Text>
                            <Text style={styles.tableCell}>Total</Text>
                        </View>

                        {/* Table Rows */}
                        {transaction.assets_transaction_item_list.map((item, index) => {
                            const { name, price } = getAssetDetails(item.asset_id);
                            const quantity = item.asset_unit || 1;
                            const total = price * quantity;
                            totalAmount += total;

                            return (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{index + 1}</Text>
                                    <Text style={styles.tableCell}>{name}</Text>
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
            </Page>
        </Document>
    );
};

// Main Component
function CheckoutDetail({ transaction, onClose }) {
    const { allAssets } = useAssetMeta();

    const getAssetDetails =  (assetId) => {
        const found = allAssets.find((a) => a.id === assetId);
        return found ? { name: found.name, price: found.asset_sales_cost } : { name: "-", price: 0 };
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
                >
                    &times;
                </button>

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Transaction Invoice</h2>
                    <PDFDownloadLink
                        document={<InvoicePDF transaction={transaction} getAssetDetails={getAssetDetails} />}
                        fileName={`Invoice_${transaction.assets_transaction_running_number}.pdf`}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
                    >
                        {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
                    </PDFDownloadLink>
                </div>

                {/* Preview (optional) */}
                <div className="bg-white p-6">
                    {/* Same content as the PDF for preview purposes */}
                    <div className="mb-6 space-y-1">
                        <p><strong>Reference Number:</strong> {transaction.assets_transaction_running_number}</p>
                        <p><strong>Branch:</strong> {transaction.assets_to_branch_name}</p>
                        <p><strong>Purpose:</strong> {transaction.assets_transaction_purpose ? JSON.parse(transaction.assets_transaction_purpose).join(", ") : "-"}</p>
                        <p><strong>Type:</strong> {transaction.assets_transaction_type}</p>
                        <p><strong>Created By:</strong> {transaction.created_by_name}</p>
                    </div>

                    {/* Item List Table */}
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Item List</h3>
                        <table className="min-w-full border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border">#</th>
                                    <th className="px-4 py-2 border">Asset Name</th>
                                    <th className="px-4 py-2 border">Quantity</th>
                                    <th className="px-4 py-2 border">Price (Each)</th>
                                    <th className="px-4 py-2 border">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaction.assets_transaction_item_list.map((item, index) => {
                                    const { name, price } = getAssetDetails(item.asset_id);
                                    const quantity = item.asset_unit || 1;
                                    const total = price * quantity;
                                    return (
                                        <tr key={index}>
                                            <td className="px-4 py-2 border text-center">{index + 1}</td>
                                            <td className="px-4 py-2 border">{name}</td>
                                            <td className="px-4 py-2 border text-center">{quantity}</td>
                                            <td className="px-4 py-2 border text-right">RM {Number(price).toFixed(2)}</td>
                                            <td className="px-4 py-2 border text-right">RM {Number(total).toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Total Amount */}
                        <div className="flex justify-end mt-4">
                            <div className="text-right">
                                <p className="text-lg font-bold">Total Amount: RM {transaction.assets_transaction_item_list.reduce((sum, item) => {
                                    const { price } = getAssetDetails(item.asset_id);
                                    const quantity = item.asset_unit || 1;
                                    return sum + (price * quantity);
                                }, 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: "Roboto",
    },
    header: {
        marginBottom: 20,
        borderBottom: 1,
        borderColor: "#e5e7eb",
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    section: {
        marginBottom: 15,
    },
    label: {
        fontSize: 10,
        color: "#6b7280",
        marginBottom: 4,
    },
    value: {
        fontSize: 12,
        marginBottom: 8,
    },
    table: {
        width: "100%",
        marginTop: 20,
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
        fontSize: 12,
        flex: 1,
        textAlign: "center",
    },
    totalContainer: {
        marginTop: 20,
        textAlign: "right",
    },
    totalText: {
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default CheckoutDetail;
