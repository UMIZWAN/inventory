import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';
import { all } from 'axios';

const AssetsContext = createContext();

export const AssetMetaProvider = ({ children }) => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [branches, setBranches] = useState([]);
  const [assetIn, setAssetIn] = useState([]);
  const [assetOut, setAssetOut] = useState([]);
  const [assetTransfer, setAssetTransfer] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.branch_id) {
      fetchAssets(user?.branch_id);
      fetchAssetTransaction();
    }
  }, [user]);

  const fetchAssets = (branchId) => {
    setLoading(true);
    api.get('/api/assets')
      .then(response => {
        if (response.data.success) {
          const allAssets = response.data.data;
  
          const processedAssets = branchId 
            ? allAssets
                // Filter assets that exist in this branch
                .filter(asset => 
                  asset.branch_values?.some(bv => 
                    bv.asset_branch_id === parseInt(branchId)
                  )
                )
                // Transform to show only the selected branch's data
                .map(asset => {
                  const branchData = asset.branch_values.find(
                    bv => bv.asset_branch_id === parseInt(branchId)
                  );
                  return {
                    ...asset,
                    // Override asset-wide properties with branch-specific ones
                    asset_current_unit: branchData.asset_current_unit,
                    asset_location_id: branchData.asset_location_id,
                    asset_location_name: branchData.asset_location_name,
                    // Keep only the selected branch's data
                    branch_values: [branchData]
                  };
                })
            : allAssets;
  
          setAllAssets(allAssets);
          setAssets(processedAssets);
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
  // Tag functions
  // --------------------------------------------------------------------------------
  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/assets-tag');
      const data = res.data?.data;
      setTags(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const addTag = async (name) => {
    await api.post('/api/assets-tag', { name });
    fetchTags();
  };

  const updateTag = async (id, name) => {
    await api.put(`/api/assets-tag/${id}`, { name });
    fetchTags();
  };

  const deleteTag = async (id) => {
    await api.delete(`/api/assets-tag/${id}`);
    fetchTags();
  };

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
        assets_transaction_running_number: generateRunningNumber(), // we'll create this below
        assets_transaction_type: 'ASSET TRANSFER',
        assets_transaction_status: form.status.toUpperCase(), // make sure it's uppercase
        assets_from_branch_id: parseInt(form.fromBranch),
        assets_to_branch_id: parseInt(form.toBranch),
        assets_shipping_option: form.shipping,
        created_by: user?.id,
        created_at: form.date,
        assets_transaction_remark: form.remarks,
        assets_transaction_purpose: form.purpose,
        assets_transaction_total_cost: totalAmount,
        assets_transaction_item_list: form.items.map((item) => ({
          asset_id: parseInt(item.item),
          asset_unit: parseInt(item.quantity),
          status: null,
        })),
      };

      const res = await api.post("api/assets-transaction", payload);

      fetchAssetTransaction();
      fetchAssets();
      return res.data;
    } catch (error) {
      console.error("Failed to create transfer:", error);
      throw error;
    }
  };

  // Optional simple running number generator (for frontend demo only)
  const generateRunningNumber = () => {
    const now = new Date();
    return `AST-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`;
  };

  const createStockOut = async (form) => {
    console.log("Creating stock out with form:", form);
    try {
      const payload = {
        assets_transaction_running_number: generateRunningNumber(),
        assets_transaction_type: 'ASSET OUT', // Always "ASSET OUT"
        assets_from_branch_id: user?.branch_id,
        assets_recipient_name: form.recipient,
        created_by: user?.id,
        created_at: form.date,
        assets_transaction_remark: form.remarks,
        assets_transaction_purpose: form.purpose,
        assets_transaction_total_cost: form.totalAmount,
        assets_transaction_item_list: form.items.map((item) => ({
          asset_id: parseInt(item.item),
          asset_unit: parseFloat(item.quantity),
          status: null,
        })),
      };

      const res = await api.post("/api/assets-transaction", payload);

      fetchAssetTransaction(); // Refresh the list after update
      fetchAssets(); // Refresh the assets list
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
          asset_unit: parseFloat(item.recvQty),
          // asset_unit_cost: parseFloat(item.unitCost),
          status: null,
        })),
      };

      const res = await api.post("/api/assets-transaction", payload);
      fetchAssetTransaction(); // Refresh the list after update
      fetchAssets(); // Refresh the assets list
      return res.data;
    } catch (error) {
      console.error("Failed to create asset in transaction:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchTags();
    fetchCategories();
    fetchAssets();
    fetchAssetTransaction();
  }, []);

  return (
    <AssetsContext.Provider
      value={{
        assets,
        fetchAssets,
        addAsset,
        updateAsset,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        tags,
        addTag,
        updateTag,
        deleteTag,
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
      }}
    >

      {children}
    </AssetsContext.Provider>
  );
};

export const useAssetMeta = () => useContext(AssetsContext);
