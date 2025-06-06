import React, { useEffect, useState } from 'react';
import { useAssetMeta } from '../context/AssetsContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { Head } from '@inertiajs/react';

const CategoryPage = () => {
  const { user } = useAuth();
  const {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchCategories,
  } = useAssetMeta();

  const [form, setForm] = useState({ name: '', id: null });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCategories(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateCategory(form.id, form.name);
      } else {
        await addCategory(form.name);
      }
      setForm({ name: '', id: null });
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, id: cat.id });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
    }
  };

  return (
    <Layout>
      <Head title="Asset Categories" />
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Asset Categories</h1>

        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4 space-y-4">
          {user?.settings && (
            <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
              <input
                type="text"
                placeholder="Category name"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {isEditing ? 'Update' : 'Add'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  onClick={() => {
                    setForm({ name: '', id: null });
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          )}

          <div className="overflow-x-auto">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                    {user?.settings && (
                      <th className="px-6 py-3 text-xs font-medium text-gray-700 text-center uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.name}</td>
                      {user?.settings && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          {/* <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button> */}
                        </td>
                      )}
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-4">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
