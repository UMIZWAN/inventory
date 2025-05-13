// ItemsTable.jsx (React Select version)
import React from "react";
import Select from "react-select";

function ItemsTable({ columns, items, onChange, onAdd, onRemove, showAddRemove = true }) {
  return (
    <div>
      <table className="w-full table-auto border mt-4 text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`${col.width || ""} border px-3 py-2 ${col.align || "text-left"}`}>
                {col.label}
              </th>
            ))}
            {showAddRemove && <th className="border px-3 py-2 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td key={col.key} className={`border px-3 py-2 ${col.align || "text-left"}`}>
                  {col.type === "select" ? (
                    <Select
                    value={col.options.find(opt => opt.value === row[col.key])}
                    onChange={(selected) => onChange(rowIndex, col.key, selected?.value || "")}
                    options={col.options}
                    placeholder="[Select]"
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                    formatOptionLabel={(opt, { context }) =>
                      context === "menu" ? (
                        <div className="flex justify-between">
                          <span>{opt.label}</span>
                          {opt.qty && opt.qty !== '—' && (
                            <span className="text-sm text-gray-500">({opt.qty})</span>
                          )}
                        </div>
                      ) : (
                        `${opt.label}`
                      )
                    }
                  />
                  

                  ) : (
                    <input
                      type={col.type || "text"}
                      step={col.step}
                      min={col.min}
                      value={row[col.key]}
                      onChange={(e) => onChange(rowIndex, col.key, e.target.value)}
                      className={`w-full border rounded px-2 py-1 ${col.align?.includes("right") ? "text-right" : ""
                        }`}
                    />
                  )}
                </td>
              ))}
              {showAddRemove && (
                <td className="border px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => onRemove(rowIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showAddRemove && (
        <div className="mt-2">
          <button
            type="button"
            onClick={onAdd}
            className="text-blue-600 hover:underline"
          >
            + Add Item
          </button>
        </div>
      )}
    </div>
  );
}

export default ItemsTable;
