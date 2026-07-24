import { useEffect, useState, useRef } from 'react';
import { FiFileText, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { Head } from '@inertiajs/react';
import { useOptions } from '../context/OptionContext';

const GRID_COLS = { display: 'grid', gridTemplateColumns: '1fr 100px' };

const PurposePage = () => {
  const { user } = useAuth();
  const {
    fetchInvType,
    invType,
    addInvType,
    updateInvType,
    loading,
  } = useOptions();

  const [form, setForm] = useState({ name: '', id: null });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const debounceTimer = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    fetchInvType();
  }, []);

  useEffect(() => {
    setFilteredData(invType);
  }, [invType]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      const filtered = invType.filter(item =>
        item.asset_transaction_purpose_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm, invType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateInvType(form.id, form.name);
      } else {
        await addInvType(form.name);
      }
      setForm({ name: '', id: null });
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving purpose:', err);
    }
  };

  const handleEdit = (item) => {
    setForm({ name: item.asset_transaction_purpose_name, id: item.id });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm({ name: '', id: null });
    setIsEditing(false);
  };

  return (
    <Layout>
      <Head title="Invoice Purpose" />
      <div className="py-1 px-1">
        <div className="flex flex-col gap-4">
          {user?.settings && (
            <div className="border border-gray-200 rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">
                {isEditing ? 'Edit Purpose' : 'Add Purpose'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Purpose name"
                  className="w-full min-h-[38px] px-3 text-sm bg-white border-0 border-b border-gray-200 focus:outline-none focus:border-indigo-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {isEditing ? 'Update' : 'Add'}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          <div className="border border-gray-200 rounded-2xl bg-white p-4 shadow-sm flex-1">
            {/* Panel head: search */}
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="relative w-full max-w-[280px]">
                <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full min-h-[38px] pl-[30px] pr-3 text-sm bg-white border-0 border-b border-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
                <FiFileText className="text-4xl text-gray-300" />
                <p className="text-lg font-medium">Loading purposes...</p>
              </div>
            ) : (
              <>
                {/* Table head */}
                <div
                  style={GRID_COLS}
                  className="px-3 pb-2 text-[11px] uppercase tracking-[0.08em] text-gray-500 border-b border-gray-200 mb-1"
                >
                  <span>Name</span>
                  <span className="text-right">Actions</span>
                </div>

                {/* Rows */}
                {filteredData.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
                    <FiFileText className="text-4xl text-gray-300" />
                    <p className="text-lg font-medium">No purposes found</p>
                    <p className="text-sm">Try adjusting your search criteria.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {filteredData.map((row) => (
                      <div
                        key={row.id}
                        style={GRID_COLS}
                        className="items-center px-3 py-3.5 text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold">{row.asset_transaction_purpose_name}</span>
                        <span className="text-right">
                          {user?.settings && (
                            <button
                              onClick={() => handleEdit(row)}
                              className="text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              Edit
                            </button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PurposePage;
