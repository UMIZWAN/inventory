import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api';

const AssetsContext = createContext();

export const AssetMetaProvider = ({ children }) => {
  const [categories, setCategories] = useState({});
  const [tags, setTags] = useState({});
  const [branches, setBranches] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllMeta = async () => {
      try {
        const [catRes, tagRes, branchRes] = await Promise.all([
          api.get('/api/assets-category'),
          api.get('/api/assets-tag'),
          api.get('/api/assets-branch'),
        ]);

        const catMap = {};
        const tagMap = {};
        const branchMap = {};

        catRes.data.data.forEach((item) => {
          catMap[item.id] = item.name;
        });

        tagRes.data.data.forEach((item) => {
          tagMap[item.id] = item.name;
        });

        branchRes.data.data.forEach((item) => {
          branchMap[item.id] = item.name;
        });

        setCategories(catMap);
        setTags(tagMap);
        setBranches(branchMap);
      } catch (err) {
        console.error('Error fetching metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMeta();
  }, []);

  return (
    <AssetsContext.Provider value={{ categories, tags, branches, loading }}>
      {children}
    </AssetsContext.Provider>
  );
};

export const useAssetMeta = () => useContext(AssetsContext);
