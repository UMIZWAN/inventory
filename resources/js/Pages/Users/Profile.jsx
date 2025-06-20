import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import api from '../../api/api'; // your Axios instance

export default function Profile() {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  });

  console.log('User:', user);
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/api/users/${user.id}`, formData);
      setEditing(false);
      setFormData({ password: '', password_confirmation: '' });
      setErrors({});
      setToast('Password changed successfully!');
      setTimeout(() => {
        setToast(null);
      }, 2000);
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error('Update failed:', error);
      }
    }
  };

  return (
    <Layout>
      {toast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        <div className="mb-4">
          <p className="text-gray-600 font-medium">Name</p>
          <p>{user.name}</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-600 font-medium">Email</p>
          <p>{user.email}</p>
        </div>

        {!editing ? (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            onClick={() => setEditing(true)}
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="px-4 py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                name="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="px-4 py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.password_confirmation && (
                <div className="text-red-500 text-sm mt-1">{errors.password_confirmation}</div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
              >
                Save Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setErrors({});
                  setFormData({ password: '', password_confirmation: '' });
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
