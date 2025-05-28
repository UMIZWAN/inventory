import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

const AssetsContext = createContext();

export const AssetMetaProvider = ({ children }) => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [branchItem, setBranchItem] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [assetIn, setAssetIn] = useState([]);
  const [assetOut, setAssetOut] = useState([]);
  const [assetTransfer, setAssetTransfer] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = (branchId) => {
    setLoading(true);
    api.get('/api/assets')
      .then(response => {
        if (response.data.success) {
          const allAssets = response.data.data;
          setAllAssets(allAssets);
        }
      })
      .catch(error => {
        console.error('Error fetching assets:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchBranchAssets = (branchId) => {
    setLoading(true);
    api.get('/api/assets/get-by-branch')
      .then(response => {
        if (response.data.success) {
          setAssets(response.data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching assets:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchItemList = () => {
    setLoading(true);
    api.get('/api/assets/get-itemlist')
      .then(response => {
        if (response.data.success) {
          setItemList(response.data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching assets:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchBranchItem = (branchId) => {
    setLoading(true);
    api.get('/api/assets/get-list-branch', {
      params: { asset_branch_id: branchId }
    })
      .then(response => {
        if (response.data.success) {
          setBranchItem(response.data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching assets:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };  

  const getOneAsset = (id) => {
    api.get(`/api/assets/${id}`)
      .then(response => {
        if (response.data.success) {
          setAssets(response.data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching assets:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const addAsset = async (form) => {
    console.log('Adding asset:', form);

    try {
      await api.post('/api/assets', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      fetchAssets(); // Refresh the list after update
      fetchBranchAssets();
    } catch (err) {
      console.error('Failed to update asset:', err);
      throw err;
    }
  };

  const updateAsset = async (id, data) => {
    try {
      let config = {};

      // Set headers based on whether we're sending FormData or JSON
      if (data instanceof FormData) {
        config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      } else {
        config = {
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }

      await api.post(`/api/assets/${id}/upload`, data, config);
      fetchAssets(user?.branch_id);
      fetchBranchAssets();
    } catch (err) {
      console.error('Failed to update asset:', err);
      throw err;
    }
  };

  // --------------------------------------------------------------------------------
  // Branch functions
  // --------------------------------------------------------------------------------
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/assets-branch');
      setBranches(res.data.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBranch = async (name) => {
    await api.post('/api/assets-branch', { name });
    fetchBranches();
  };

  const updateBranch = async (id, name) => {
    await api.put(`/api/assets-branch/${id}`, { name });
    fetchBranches();
  };

  const deleteBranch = async (id) => {
    await api.delete(`/api/assets-branch/${id}`);
    fetchBranches();
  };

  // --------------------------------------------------------------------------------
  // Category functions
  // --------------------------------------------------------------------------------
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/assets-category');
      setCategories(res.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name) => {
    await api.post('/api/assets-category', { name });
    fetchCategories();
  };

  const updateCategory = async (id, name) => {
    await api.put(`/api/assets-category/${id}`, { name });
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    await api.delete(`/api/assets-category/${id}`);
    fetchCategories();
  };

  const getCategoryById = (id) => categories.find(c => c.id === id);

  // --------------------------------------------------------------------------------
  // Asset Transaction functions
  // --------------------------------------------------------------------------------
  const fetchAssetTransaction = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/assets-transaction');
      const transactions = res.data.data;

      // Separate transactions by type and branch
      const assetIn = transactions.filter(tx => tx.assets_transaction_type === 'ASSET IN' && tx.assets_from_branch_id === user?.branch_id);
      const assetOut = transactions.filter(tx => tx.assets_transaction_type === 'ASSET OUT' && tx.assets_from_branch_id === user?.branch_id);
      const assetTransfer = transactions.filter(tx => tx.assets_transaction_type === 'ASSET TRANSFER' && (tx.assets_from_branch_id === user?.branch_id || tx.assets_to_branch_id === user?.branch_id));

      // Update your states accordingly
      setAssetIn(assetIn);
      setAssetOut(assetOut);
      setAssetTransfer(assetTransfer);

    } catch (error) {
      console.error('Error fetching asset transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTransfer = async (form, totalAmount) => {
    try {
      const payload = {
        assets_transaction_type: 'ASSET TRANSFER',
        assets_transaction_status: form.status.toUpperCase(), // make sure it's uppercase
        assets_from_branch_id: parseInt(form.fromBranch),
        assets_to_branch_id: parseInt(form.toBranch),
        assets_shipping_option_id: form.shipping,
        assets_transaction_purpose_id: form.purpose,
        created_by: user?.id,
        created_at: form.date,
        assets_transaction_remark: form.remarks,
        assets_transaction_total_cost: totalAmount,
        assets_transaction_item_list: form.items.map((item) => ({
          asset_id: parseInt(item.item),
          asset_unit: parseInt(item.quantity),
          status: null,
        })),
      };

      const res = await api.post("api/assets-transaction", payload);

      fetchAssetTransaction();
      fetchBranchAssets();
      return res.data;
    } catch (error) {
      console.error("Failed to create transfer:", error);
      throw error;
    }
  };

  const createStockOut = async (form) => {
    try {
      const payload = {
        assets_transaction_type: 'ASSET OUT', // Always "ASSET OUT"
        assets_transaction_status: form.status.toUpperCase(),
        assets_from_branch_id: user?.branch_id,
        assets_recipient_name: form.recipient,
        created_by: user?.id,
        created_at: form.date,
        assets_transaction_remark: form.remarks,
        attachment: form.attachment,
        assets_transaction_purpose_id: form.purposes,
        assets_transaction_total_cost: form.totalAmount,
        assets_transaction_item_list: form.items.map((item) => ({
          asset_id: parseInt(item.item),
          asset_unit: parseFloat(item.quantity),
          status: "",
        })),
      };

      const res = await api.post("/api/assets-transaction", payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      fetchAssetTransaction(); // Refresh the list after update
      fetchBranchAssets(); // Refresh the assets list
      return res.data;
    } catch (error) {
      console.error("Failed to create stock out:", error);
      throw error;
    }
  };

  const createAssetIn = async (form) => {
    try {
      const payload = {
        assets_transaction_running_number: form.referenceNo,
        assets_transaction_type: 'ASSET IN',
        assets_from_branch_id: user?.branch_id,
        supplier_id: form.supplierId,
        created_by: user?.id,
        // created_at: form.date,
        // received_by: user?.id,
        received_at: form.date,
        assets_transaction_remark: form.note,
        assets_transaction_purpose: "RECEIVE STOCK",
        assets_supplier_id: parseInt(form.supplierId),
        assets_transaction_total_cost: form.totalAmount,
        assets_transaction_item_list: form.items.map((item) => ({
          asset_id: parseInt(item.item),
          asset_unit: parseInt(item.recvQty),
          asset_purchase_cost: parseFloat(item.unitCost),
          asset_sales_cost: parseFloat(item.price),
          status: null,
        })),
      };

      const res = await api.post("/api/assets-transaction", payload);
      fetchAssetTransaction(); // Refresh the list after update
      fetchBranchAssets(); // Refresh the assets list
      return res.data;
    } catch (error) {
      console.error("Failed to create asset in transaction:", error);
      throw error;
    }
  };

  const fetchReport = async (branchId) => {
    setLoading(true);
    try {
      const res = await api.get('/api/report', {
        params: { asset_branch_id: branchId }
      });
      setReport(res.data.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <AssetsContext.Provider
      value={{
        assets,
        fetchBranchAssets,
        fetchAssets,
        fetchItemList,
        itemList,
        fetchBranchItem,
        branchItem,
        addAsset,
        updateAsset,
        categories,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        branches,
        fetchBranches,
        addBranch,
        updateBranch,
        deleteBranch,
        loading,
        assetTransfer,
        assetIn,
        assetOut,
        createTransfer,
        createStockOut,
        createAssetIn,
        fetchAssetTransaction,
        allAssets,
        fetchReport,
        report,
      }}
    >

      {children}
    </AssetsContext.Provider>
  );
};

export const useAssetMeta = () => useContext(AssetsContext);
