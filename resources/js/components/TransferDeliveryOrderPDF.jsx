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

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  logo: { width: 250, height: 26, marginBottom: 25, alignSelf: "center" },
  header: { fontSize: 16, marginBottom: 20, textAlign: "center", textTransform: "uppercase", fontWeight: "bold" },
  section: { marginBottom: 20 },
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
  tableColHeader: {
    width: "20%",
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
    padding: 8,
  },
  tableCol: {
    padding: 8,
    fontSize: 11,
    flex: 1,
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

const TransferDeliveryOrderPDF = ({ data, items }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Image style={styles.logo} src={logo} />
      <Text style={styles.header}>Transfer Note</Text>

      <View style={styles.section}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text>
            <Text style={styles.label}>From:</Text> {data?.assets_from_branch_name}{" "}
            <Text style={styles.label}>To:</Text> {data?.assets_to_branch_name}
          </Text>
          <Text style={{ width: 180, textAlign: "left" }}>
            <Text style={styles.label}>Date:</Text>{" "}
            {new Date(data?.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text>
            <Text style={styles.label}>Purpose:</Text>{" "}
            {data?.asset_transaction_purpose_name}
          </Text>
          <Text style={{ width: 180, textAlign: "left" }}>
            <Text style={styles.label}>Ref. No.:</Text>{" "}
            {data?.assets_transaction_running_number}
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text>
            <Text style={styles.label}>Shipping Option:</Text>{" "}
            {data?.assets_shipping_option_name}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          {["Code", "Name", "Category", "Price", "Quantity", "Total Price"].map((col) => (
            <Text key={col} style={styles.tableColHeader}>
              {col}
            </Text>
          ))}
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={styles.tableCol}>{item.assets.asset_running_number}</Text>
            <Text style={styles.tableCol}>{item.asset_name}</Text>
            <Text style={styles.tableCol}>{item.assets.asset_category_name}</Text>
            <Text style={styles.tableCol}>
              RM {Number(item.assets.asset_sales_cost).toFixed(2)}
            </Text>
            <Text style={styles.tableCol}>{item.asset_unit}</Text>
            <Text style={styles.tableCol}>RM {Number(item.assets.asset_sales_cost * item.asset_unit).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Remark: {data?.assets_transaction_remark || '-'}</Text>
        </View>
      </View>

      <View style={styles.signatureRow}>
        <View style={styles.issuedBlock}>
          <Text style={{ marginBottom: 10, textTransform: "capitalize" }}>
            <Text>Issued by</Text> {data?.created_by_name}
          </Text>
          <Text>
            <Text>{data?.assets_from_branch_name}</Text>
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
