import { useState } from "react";
import { useSuppliers } from "../context/SuppliersContext";

const AddSupplierModal = ({ open, onClose }) => {
  const { addSupplier } = useSuppliers();
  const [form, setForm] = useState({
    supplier_name: "",
    supplier_office_number: "",
    supplier_email: "",
    supplier_address: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addSupplier(form);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Add Supplier</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {["supplier_name", "supplier_office_number", "supplier_email", "supplier_address"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium capitalize mb-1">
                {field.replace(/_/g, " ")}
              </label>
              <input
                type="text"
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplierModal;
