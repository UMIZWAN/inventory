import { createContext, useContext, useEffect, useState } from "react";
import api from '../api/api';
const OptionContext = createContext();

export const OptionProvider = ({ children }) => {
  const [shipping, setShipping] = useState([]);
  const [invType, setInvType] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchShipping = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/shipping");
      setShipping(res.data.data);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  const addShipping = async (name) => {
    await api.post('/api/shipping', { shipping_option_name: name });
    fetchShipping();
  };

  const updateShipping = async (id, name) => {
    await api.put(`/api/shipping/${id}`, { shipping_option_name: name });
    fetchShipping();
  };

  const deleteShipping = async (id) => {
    await api.delete(`/api/shipping/${id}`);
    fetchShipping();
  };

  //--------------------------------------------------------------------------
  // invoice type function
  //--------------------------------------------------------------------------

  const fetchInvType = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/purpose");
      setInvType(res.data.data);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  const addInvType = async (name) => {
    await api.post('/api/purpose', { asset_transaction_purpose_name: name });
    fetchInvType();
  };

  const updateInvType = async (id, name) => {
    await api.put(`/api/purpose/${id}`, { asset_transaction_purpose_name: name });
    fetchInvType();
  };

  const deleteInvType = async (id) => {
    await api.delete(`/api/purpose/${id}`);
    fetchInvType();
  };

  // useEffect(() => {
  //   fetchSuppliers();
  // }, []);

  return (
    <OptionContext.Provider 
        value={{ 
            fetchShipping, 
            shipping, 
            loading, 
            addShipping, 
            updateShipping,
            fetchInvType, 
            invType, 
            addInvType, 
            updateInvType,
        }}
    >
      {children}
    </OptionContext.Provider>
  );
};

export const useOptions = () => useContext(OptionContext);
