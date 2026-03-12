import { useEffect, useState, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { BiCategory } from 'react-icons/bi';
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
    fetchCategories,
  } = useAssetMeta();

  const [form, setForm] = useState({ name: '', id: null });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const debounceTimer = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setFilteredData(categories);
  }, [categories]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      const filtered = categories.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm, categories]);

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

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    ...(user?.settings ? [{
      name: 'Actions',
      center: true,
      cell: (row) => (
        <button
          onClick={() => handleEdit(row)}
          className="text-indigo-600 hover:text-indigo-900"
        >
          Edit
        </button>
      ),
    }] : []),
  ];

  const LoadingComponent = () => (
    <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
      <BiCategory className="text-4xl text-gray-300" />
      <p className="text-lg font-medium">Loading categories...</p>
    </div>
  );

  const NoDataComponent = () => (
    <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
      <BiCategory className="text-4xl text-gray-300" />
      <p className="text-lg font-medium">No categories found</p>
      <p className="text-sm">Try adjusting your search criteria.</p>
    </div>
  );

  return (
    <Layout>
      <Head title="Asset Categories" />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Asset Categories</h1>

        <div className={`flex flex-col ${user?.settings ? 'lg:flex-row' : ''} gap-4`}>
          {user?.settings && (
            <div className="bg-white shadow-md rounded-lg p-4 lg:w-1/3 h-fit">
              <h2 className="text-lg font-semibold mb-3">{isEditing ? 'Edit Category' : 'Add Category'}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Category name"
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <div className="flex gap-2">
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
                </div>
              </form>
            </div>
          )}

          <div className="bg-white shadow-md rounded-lg p-4 flex-1">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-full border border-gray-300 w-full sm:w-1/3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <DataTable
              columns={columns}
              data={filteredData}
              progressPending={loading}
              progressComponent={<LoadingComponent />}
              pagination
              highlightOnHover
              striped
              noDataComponent={<NoDataComponent />}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
