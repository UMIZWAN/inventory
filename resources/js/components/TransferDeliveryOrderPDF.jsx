import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from "@react-pdf/renderer";

// Optional: Register font (if needed for styling)
// Font.register({ family: 'Roboto', src: 'https://...' });

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  header: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  section: { marginBottom: 10 },
  label: { fontWeight: 'bold' },
  table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, marginTop: 10 },
  tableRow: { flexDirection: "row" },
  tableColHeader: { width: "20%", borderStyle: "solid", borderWidth: 1, backgroundColor: '#eee', padding: 4 },
  tableCol: { width: "20%", borderStyle: "solid", borderWidth: 1, padding: 4 },
  signature: { marginTop: 30 }
});

const TransferDeliveryOrderPDF = ({ data, items }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Delivery Order</Text>

      <View style={styles.section}>
        <Text><Text style={styles.label}>Running Number:</Text> {data?.assets_transaction_running_number}</Text>
        <Text><Text style={styles.label}>Status:</Text> {data?.assets_transaction_status}</Text>
        <Text><Text style={styles.label}>From:</Text> {data?.assets_from_branch_name}</Text>
        <Text><Text style={styles.label}>To:</Text> {data?.assets_to_branch_name}</Text>
        <Text><Text style={styles.label}>Shipping Option:</Text> {data?.assets_shipping_option}</Text>
        <Text><Text style={styles.label}>Created At:</Text> {new Date(data?.created_at).toLocaleString()}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          {["Name", "Category", "Price", "Quantity", "Total"].map(col => (
            <Text key={col} style={styles.tableColHeader}>{col}</Text>
          ))}
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={styles.tableCol}>{item.name}</Text>
            <Text style={styles.tableCol}>{item.category}</Text>
            <Text style={styles.tableCol}>{Number(item.price).toFixed(2)}</Text>
            <Text style={styles.tableCol}>{item.asset_unit}</Text>
            <Text style={styles.tableCol}>{(item.price * item.asset_unit).toLocaleString()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.signature}>
        <Text>___________________________</Text>
        <Text>Receiver's Signature</Text>
      </View>
    </Page>
  </Document>
);

export default TransferDeliveryOrderPDF;
