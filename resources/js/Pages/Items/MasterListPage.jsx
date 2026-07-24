import { useState, useEffect, useRef } from "react";
import DataTable from 'react-data-table-component';
import api from "../../api/api";
import Layout from '../../components/layout/Layout';
import { Head } from "@inertiajs/react";
import ExportButton from "../../components/ExportButton";
import { useAuth } from "../../context/AuthContext";
import placeholder from '../../assets/image/placeholder.png';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { LINKS } from "../../constants/links";
import { FiPackage } from "react-icons/fi";

const MasterListPage = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);
    const [editRowId, setEditRowId] = useState(null);
    const [editedValue, setEditedValue] = useState("");

    const debounceTimer = useRef(null);
    const isInitialMount = useRef(true);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/assets");
            if (response.data.success && response.data.data) {
                setItems(response.data.data);
                setFilteredItems(response.data.data);
            } else {
                console.error("No assets found or invalid response format");
            }
        } catch (error) {
            console.error("Error fetching assets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        setFilteredItems(items);
    }, [items]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setFilteredItems(items);
            } else {
                const filtered = items.filter(
                    (item) =>
                        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.asset_running_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.asset_category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.asset_tag_name?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredItems(filtered);
            }
        }, 300);
        return () => clearTimeout(debounceTimer.current);
    }, [searchTerm, items]);

    const handleEdit = (id, currentValue) => {
        setEditRowId(id);
        setEditedValue(currentValue);
    };

    const handleSaveEdit = async (id) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, asset_running_number: editedValue } : item
            )
        );
        await api.put(`/api/assets/${id}`, { asset_running_number: editedValue });
        setEditRowId(null);
        setEditedValue("");
    };

    const handleCancelEdit = () => {
        setEditRowId(null);
        setEditedValue("");
    };

    const getStatusBadge = (totalUnits, stableUnit) => {
        if (!totalUnits || !stableUnit) {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Critical Stock
                </span>
            );
        }
        const percentage = (totalUnits / stableUnit) * 100;
        if (percentage >= 100) {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    In Stock
                </span>
            );
        } else if (percentage >= 50) {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Low Stock
                </span>
            );
        } else {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Critical Stock
                </span>
            );
        }
    };

    const columns = [
        {
            name: 'Code',
            cell: (row) => (
                editRowId === row.id ? (
                    <input
                        type="text"
                        className="text-sm text-gray-900 border border-gray-300 rounded-md px-2 py-1 w-full"
                        value={editedValue}
                        onChange={(e) => setEditedValue(e.target.value)}
                        onBlur={() => handleSaveEdit(row.id)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                e.target.blur();
                            }
                            if (e.key === "Escape") {
                                handleCancelEdit();
                            }
                        }}
                        autoFocus
                    />
                ) : (
                    <div className="text-sm text-gray-500 flex items-center gap-1 group">
                        <span>{row.asset_running_number}</span>
                        {user?.add_edit_asset && (
                            <button
                                onClick={() => handleEdit(row.id, row.asset_running_number)}
                                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600"
                                title="Edit"
                            >
                                ✎
                            </button>
                        )}
                    </div>
                )
            ),
            sortable: true,
            selector: row => row.asset_running_number,
        },
        {
            name: 'Image',
            cell: (row) => (
                <div className="flex-shrink-0 h-10 w-10 py-1">
                    <Zoom>
                        <img
                            className="h-10 w-10 rounded"
                            src={row.asset_image ? `${LINKS.API_BASE}/${row.asset_image}` : placeholder}
                            alt={row.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = placeholder;
                            }}
                        />
                    </Zoom>
                </div>
            ),
            width: '80px',
        },
        {
            name: 'Item Name',
            selector: row => row.name,
            sortable: true,
            cell: (row) => (
                <span className="text-sm font-medium text-gray-900 whitespace-pre-line">{row.name}</span>
            ),
        },
        {
            name: 'Category',
            selector: row => row.asset_category_name || "N/A",
            sortable: true,
        },
        {
            name: 'Total Qty',
            selector: row => row.total_units || 0,
            sortable: true,
            center: true,
        },
        {
            name: 'Status',
            center: true,
            cell: (row) => getStatusBadge(row.total_units, row.asset_stable_unit),
            sortable: true,
            selector: row => {
                const total = row.total_units;
                const stable = row.asset_stable_unit;
                if (!total || !stable) return 0;
                return (total / stable) * 100;
            },
        },
        {
            name: 'Branch Distribution',
            cell: (row) => (
                <div className="text-sm text-gray-500 py-2">
                    {row.branch_values && row.branch_values.map((branch, idx) => (
                        <div key={idx} className="mb-1">
                            {branch.asset_branch_name}: {branch.asset_current_unit} {row.asset_unit_measure}
                        </div>
                    ))}
                </div>
            ),
            grow: 2,
        },
    ];

    const exportData = filteredItems.map((item) => ({
        "Asset Number": item.asset_running_number || "",
        "Item Name": item.name || "",
        "Category": item.asset_category_name || "",
        "Total Quantity": item.total_units || 0,
        "Status": (() => {
            const total = item.total_units;
            const stable = item.asset_stable_unit;
            if (!total || !stable) return "Critical Stock";
            const pct = (total / stable) * 100;
            if (pct >= 100) return "In Stock";
            else if (pct >= 50) return "Low Stock";
            else return "Critical Stock";
        })(),
        "Branch Distribution": item.branch_values
            ? item.branch_values
                .map(
                    (branch) =>
                        `${branch.asset_branch_name}: ${branch.asset_current_unit} ${item.asset_unit_measure}`
                )
                .join(" \n ")
            : "",
    }));

    const LoadingComponent = () => (
        <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
            <FiPackage className="text-4xl text-gray-300" />
            <p className="text-lg font-medium">Loading assets...</p>
        </div>
    );

    const NoDataComponent = () => (
        <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
            <FiPackage className="text-4xl text-gray-300" />
            <p className="text-lg font-medium">No assets found</p>
            <p className="text-sm">Try adjusting your search criteria.</p>
        </div>
    );

    return (
        <Layout>
            <Head title="Master List" />
            <div className="max-w-full mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Master Inventory List</h1>

                <div className="bg-white shadow-md rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <input
                            type="text"
                            placeholder="Search by name, code or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-1.5 text-sm rounded-full border border-gray-300 w-full sm:w-1/3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <ExportButton
                            data={exportData}
                            filename="master_inventory_list"
                            sheetName="Inventory"
                        />
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredItems}
                        progressPending={loading}
                        progressComponent={<LoadingComponent />}
                        pagination
                        highlightOnHover
                        striped
                        noDataComponent={<NoDataComponent />}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default MasterListPage;
