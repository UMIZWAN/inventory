import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api';

const AssetsContext = createContext();

export const AssetMetaProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = () => {
    api.get('/api/assets')
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

  const updateAsset = async (id, updatedData) => {
    try {
      await api.put(`/api/assets/${id}`, updatedData);
      fetchAssets(); // Refresh the list after update
    } catch (err) {
      console.error('Failed to update asset:', err);
      throw err;
    }
  };

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

  useEffect(() => {
    fetchBranches();
    fetchTags();
    fetchCategories();
    fetchAssets();
  }, []);

  return (
    <AssetsContext.Provider
      value={{
        assets,
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
      }}
    >

      {children}
    </AssetsContext.Provider>
  );
};

export const useAssetMeta = () => useContext(AssetsContext);
