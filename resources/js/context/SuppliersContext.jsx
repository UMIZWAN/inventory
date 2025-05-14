import { createContext, useContext, useEffect, useState } from "react";
import api from '../api/api';
const SuppliersContext = createContext();

export const SuppliersProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/suppliers");
      setSuppliers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = async (supplier) => {
    try {
      const res = await api.post("/api/suppliers", supplier);
      setSuppliers((prev) => [...prev, res.data]);
      fetchSuppliers();
    } catch (err) {
      console.error("Failed to add supplier", err);
    }
  };

  const updateSupplier = async (id, data) => {
    try {
      await api.put(`/api/suppliers/${id}`, data);
      fetchSuppliers();
    } catch (err) {
      console.error('Failed to update supplier:', err);
      throw err;
    }
  }

  // useEffect(() => {
  //   fetchSuppliers();
  // }, []);

  return (
    <SuppliersContext.Provider
      value={{
        fetchSuppliers,
        suppliers,
        loading,
        addSupplier,
        updateSupplier
      }}
    >
      {children}
    </SuppliersContext.Provider>
  );
};

export const useSuppliers = () => useContext(SuppliersContext);
