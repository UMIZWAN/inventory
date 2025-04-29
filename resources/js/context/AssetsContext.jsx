import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

const AssetsContext = createContext();

export const AssetMetaProvider = ({ children }) => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [branches, setBranches] = useState([]);
  const [assetIn, setAssetIn] = useState([]);
  const [assetOut, setAssetOut] = useState([]);
  const [assetTransfer, setAssetTransfer] = useState([]);
  const [loading, setLoading] = useState(true);

  // const fetchAssets = () => {
  //   api.get('/api/assets')
  //     .then(response => {
  //       if (response.data.success) {
  //         console.log('Assets fetched:', response.data.data);
  //         setAssets(response.data.data);
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error fetching assets:', error);
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };

  useEffect(() => {
    if (user?.branch_id) {
      console.log("User branch ID:", user.branch_id);
      fetchAssets(user.branch_id);
    }
  }, [user]);

  const fetchAssets = (branchId) => {
    api.get('/api/assets')
      .then(response => {
        if (response.data.success) {
          const allAssets = response.data.data;

          // Filter assets that have at least one branch_value for the current user's branch
          const userBranchAssets = allAssets.filter(asset =>
            asset.branch_values?.some(bv => bv.asset_branch_id === user?.branch_id)
          );

          console.log('Filtered assets for user branch:', userBranchAssets);
          setAssets(userBranchAssets);
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
    // const formData = new FormData();
    // Object.entries(form).forEach(([key, value]) => {
    //   if (key === 'assets_remark') {
    //     value.split('\n').forEach((line, i) => {
    //       formData.append(`assets_remark[${i}]`, line);
    //     });
    //   } else {
    //     formData.append(key, value);
    //   }
    // });

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

  const updateAsset = async (id, formData) => {
    console.log('Updating asset:', id, formData);
    try {
      await api.put(`/api/assets/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchAssets();
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

      // Separate transactions by type
      const assetIn = transactions.filter(tx => tx.assets_transaction_type === 'ASSET IN');
      const assetOut = transactions.filter(tx => tx.assets_transaction_type === 'ASSET OUT');
      const assetTransfer = transactions.filter(tx => tx.assets_transaction_type === 'ASSET TRANSFER');

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

  const createTransfer = async (form) => {
    try {
      const payload = {
        assets_transaction_running_number: generateRunningNumber(), // we'll create this below
        assets_transaction_type: 'ASSET TRANSFER',
        assets_transaction_status: form.status.toUpperCase(), // make sure it's uppercase
        assets_from_branch_id: parseInt(form.fromBranch),
        assets_to_branch_id: parseInt(form.toBranch),
        created_by: user?.id, 
        created_at: form.date,
        assets_transaction_remark: form.remarks,
        assets_transaction_purpose: form.purpose,
        assets_transaction_item_list: form.items.map((item) => ({
          asset_id: parseInt(item.item),
          asset_unit: parseInt(item.quantity),
          status: null,
        })),
      };

      const res = await api.post("api/assets-transaction", payload);

      console.log("Transfer created:", res.data);
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
    try {
      const payload = {
        assets_transaction_running_number: generateRunningNumber(), 
        assets_transaction_type: 'ASSET OUT', // Always "ASSET OUT"
        assets_from_branch_id: user?.branch_id,
        // assets_to_branch_id: parseInt(form.branch),
        created_by: user?.id,
        created_at: form.date,
        assets_transaction_remark: form.remarks,
        assets_transaction_purpose: form.purpose,
        assets_transaction_item_list: form.items.map((item) => ({
          asset_id: parseInt(item.item),
          asset_unit: parseFloat(item.quantity),
          status: null,
        })),
      };
  
      const res = await api.post("/api/assets-transaction", payload);
  
      console.log("Stock out created:", res.data);
      return res.data;
    } catch (error) {
      console.error("Failed to create stock out:", error);
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
        loading,
        assetTransfer,
        assetIn,
        assetOut,
        createTransfer,
        createStockOut,
      }}
    >

      {children}
    </AssetsContext.Provider>
  );
};

export const useAssetMeta = () => useContext(AssetsContext);
