import { useEffect, useState } from "react";
import { useAssetMeta } from "../context/AssetsContext";

function TransactionFilter({ onFilterChange, filterType = "transfer" }) {
  const { branches } = useAssetMeta();

  const [filters, setFilters] = useState({
    searchTerm: '',
    itemName: '',
    status: '',
    purpose: '',
    fromDate: '',
    toDate: '',
    fromBranch: '',
    toBranch: '',
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const inputStyle = "border rounded px-2 py-1 text-sm w-full";

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm text-gray-700 mb-4">
      {/* Running No */}
      <div>
        <label className="block mb-1">Running No</label>
        <input
          type="text"
          value={filters.searchTerm}
          onChange={(e) => handleChange('searchTerm', e.target.value)}
          className={inputStyle}
          placeholder="e.g. TXN0012"
        />
      </div>

      {/* Item Name */}
      <div>
        <label className="block mb-1">Item Name</label>
        <input
          type="text"
          value={filters.itemName}
          onChange={(e) => handleChange('itemName', e.target.value)}
          className={inputStyle}
          placeholder="e.g. Printer"
        />
      </div>

      {/* Status (only for transfer) */}
      {filterType === "transfer" && (
        <div>
          <label className="block mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className={inputStyle}
          >
            <option value="">-</option>
            <option value="DRAFT">Draft</option>
            <option value="IN-TRANSIT">In-Transit</option>
            <option value="RECEIVED">Received</option>
          </select>
        </div>
      )}

      {/* Purpose (only for checkout) */}
      {filterType === "checkout" && (
        <div>
          <label className="block mb-1">Purpose</label>
          <input
            type="text"
            value={filters.purpose}
            onChange={(e) => handleChange('purpose', e.target.value)}
            className={inputStyle}
            placeholder="e.g. Repair"
          />
        </div>
      )}

      {/* From Branch */}
      <div>
        <label className="block mb-1">{filterType === "checkout" ? "Branch" : "From Branch"}</label>
        <select
          value={filters.fromBranch}
          onChange={(e) => handleChange('fromBranch', e.target.value)}
          className={inputStyle}
        >
          <option value="">-</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
      </div>

      {/* To Branch (only for transfer) */}
      {filterType === "transfer" && (
        <div>
          <label className="block mb-1">To Branch</label>
          <select
            value={filters.toBranch}
            onChange={(e) => handleChange('toBranch', e.target.value)}
            className={inputStyle}
          >
            <option value="">-</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* From Date */}
      <div>
        <label className="block mb-1">From Date</label>
        <input
          type="date"
          value={filters.fromDate}
          onChange={(e) => handleChange('fromDate', e.target.value)}
          className={inputStyle}
        />
      </div>

      {/* To Date */}
      <div>
        <label className="block mb-1">To Date</label>
        <input
          type="date"
          value={filters.toDate}
          onChange={(e) => handleChange('toDate', e.target.value)}
          className={inputStyle}
        />
      </div>
    </div>
  );
}

export default TransactionFilter;