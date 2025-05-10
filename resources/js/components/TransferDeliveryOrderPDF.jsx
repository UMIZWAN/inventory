import React from "react";
import logo from '../assets/image/universal group - black logo.jpg';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Replace this with your actual logo URL or base64 string
// const logoUrl = "resources/js/assets/image/universal group - black logo.jpg";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  logo: { width: 250, height: 25, marginBottom: 25, alignSelf: "center" },
  header: { fontSize: 16, marginBottom: 20, textAlign: "center", textTransform: "uppercase", fontWeight: "bold" },
  section: { marginBottom: 20 },
  label: { fontWeight: "bold" },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    marginTop: 10,
  },
  tableRow: { flexDirection: "row" },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: "#eee",
    padding: 4,
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    padding: 4,
  },
  signatureRow: {
    flexDirection: "row",
    marginTop: 30,
    justifyContent: "space-between",
  },
  signatureBlock: { width: "45%" },
});

const TransferDeliveryOrderPDF = ({ data, items }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Image style={styles.logo} src={logo} />
      <Text style={styles.header}>Transfer Note</Text>

      <View style={styles.section}>
        <Text style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Running Number:</Text>{" "}
          {data?.assets_transaction_running_number}
        </Text>
        <Text style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Date:</Text>{" "}
          {new Date(data?.created_at).toLocaleDateString()}
        </Text>
        <Text style={{ marginBottom: 8 }}>
          <Text style={styles.label}>Transfer From:</Text> {data?.assets_from_branch_name}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>
            <Text style={styles.label}>Transfer To:</Text> {data?.assets_to_branch_name}
          </Text>
          <Text style={{ marginRight: 40 }}>
            <Text style={styles.label}>Shipping Option:</Text>{" "}
            {data?.assets_shipping_option}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          {["Code", "Name", "Category", "Price", "Quantity"].map((col) => (
            <Text key={col} style={styles.tableColHeader}>
              {col}
            </Text>
          ))}
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={styles.tableCol}>{item.code}</Text>
            <Text style={styles.tableCol}>{item.name}</Text>
            <Text style={styles.tableCol}>{item.category}</Text>
            <Text style={styles.tableCol}>
              RM {Number(item.price).toFixed(2)}
            </Text>
            <Text style={styles.tableCol}>{item.asset_unit}</Text>
          </View>
        ))}
      </View>

      <View style={styles.signatureRow}>
        <View style={styles.signatureBlock}>
          <Text style={{ marginBottom: 20 }}>Issued By:</Text>
          <Text> {data?.created_by_name}
          </Text>
        </View>
        <View style={styles.signatureBlock}>
          <Text style={{ marginBottom: 30 }}>Receiver's Signature:</Text>
          <Text>___________________________</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default TransferDeliveryOrderPDF;
