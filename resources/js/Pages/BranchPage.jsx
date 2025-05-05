import React, { useState } from 'react';
import { useAssetMeta } from '../context/AssetsContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

const BranchPage = () => {
  const { user } = useAuth();
  const {
    branches,
    fetchBranches,
    addBranch,
    updateBranch,
    deleteBranch,
    loading
  } = useAssetMeta();

  const [form, setForm] = useState({ name: '', id: null });
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateBranch(form.id, form.name);
      } else {
        await addBranch(form.name);
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
      await deleteBranch(id);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Branches</h1>

        {user?.add_edit_supplier && (
          <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder="Branch name"
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

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-3 py-2">Name</th>
                {user?.add_edit_supplier && (
                  <th className="border px-3 py-2 text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {branches.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{cat.name}</td>
                  {user?.add_edit_supplier && (
                    <td className="border px-3 py-2 text-center space-x-2">
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
              {branches.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No branches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default BranchPage;
