import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import api from '../../api/api'; // your Axios instance

export default function Profile() {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [migrationLog, setMigrationLog] = useState(null);
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

        {user.email === 'kamal@gmail.com' && (
          <div className="mb-6">
            <button
              className="text-sm text-red-600 underline hover:text-red-800"
              onClick={async () => {
                if (!window.confirm('Run pending database migrations?')) return;
                try {
                  const res = await api.post('/api/run-migrations');
                  setMigrationLog({ success: true, text: res.data.output || res.data.message });
                } catch (e) {
                  const data = e.response?.data;
                  const text = data?.output || data?.error || 'An unknown error occurred.';
                  setMigrationLog({ success: false, text });
                }
              }}
            >
              Run Migrations
            </button>
          </div>
        )}

        {migrationLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full">
              <h2 className={`text-lg font-bold mb-3 ${migrationLog.success ? 'text-green-700' : 'text-red-700'}`}>
                {migrationLog.success ? 'Migration Successful' : 'Migration Failed'}
              </h2>
              <pre className="bg-gray-100 rounded p-3 text-xs text-gray-800 overflow-auto max-h-64 whitespace-pre-wrap">
                {migrationLog.text || '(no output)'}
              </pre>
              <button
                className="mt-4 bg-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded"
                onClick={() => setMigrationLog(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

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
