import * as XLSX from "xlsx";

export default function ExportButton({ data, merges = [], filename = "Export", sheetName = "Sheet1", onClick }) {
  const handleDownload = async (format = "xlsx") => {
    if (onClick) {
      // Let parent component handle data fetching + export
      await onClick(format);
      return;
    }

    if (!data || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);

    if (merges.length > 0) {
      worksheet["!merges"] = merges;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const file = format === "csv" ? `${filename}.csv` : `${filename}.xlsx`;
    XLSX.writeFile(workbook, file, { bookType: format });
  };


  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleDownload("xlsx")}
        className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
      >
        Download Excel
      </button>
      <button
        onClick={() => handleDownload("csv")}
        className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
      >
        Download CSV
      </button>
    </div>
  );
}
