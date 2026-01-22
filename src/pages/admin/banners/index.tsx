import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Image, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import Table from "../../../components/admin/Table";
import { getAllBanners, deleteBanner } from "../../../services/adminApi";
import { Banner } from "../../../types/Admin";

const BannersPage: React.FC = () => {
  const navigate = useNavigate();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    position: "",
    isActive: "",
  });

  // Fetch banners from API
  const fetchBanners = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const queryFilters = {
        page,
        limit: pagination.limit,
        ...(filters.position &&
          ["hero", "category", "promotion", "footer"].includes(
            filters.position as string
          ) && {
            position: filters.position as
              | "hero"
              | "category"
              | "promotion"
              | "footer",
          }),
        ...(filters.isActive && { isActive: filters.isActive === "true" }),
      };

      const response = await getAllBanners(queryFilters);

      if (response.success) {
        setBanners(response.data.banners);
        setPagination(response.data.pagination);
      } else {
        throw new Error("Failed to fetch banners");
      }
    } catch (err: any) {
      console.error("Error fetching banners:", err);
      setError(err.response?.data?.message || "Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBanners();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchBanners(1);
  }, [filters]);

  const columns = [
    {
      key: "title",
      label: "Banner",
      sortable: true,
      render: (value: string, row: Banner) => (
        <div className="flex items-center">
          <img
            src={row.image}
            alt={value}
            className="h-12 w-20 rounded-lg object-cover mr-3"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/150x80?text=No+Image";
            }}
          />
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            {row.subtitle && (
              <p className="text-sm text-gray-500">{row.subtitle}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "position",
      label: "Position",
      sortable: true,
      render: (value: string) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value === "hero"
              ? "bg-purple-100 text-purple-800"
              : value === "category"
              ? "bg-blue-100 text-blue-800"
              : value === "promotion"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? (
            <Eye className="h-3 w-3 mr-1" />
          ) : (
            <EyeOff className="h-3 w-3 mr-1" />
          )}
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (value: number) => (
        <span className="text-sm font-medium">{value}</span>
      ),
    },
    {
      key: "startDate",
      label: "Start Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "endDate",
      label: "End Date",
      sortable: true,
      render: (value: string | null) =>
        value ? new Date(value).toLocaleDateString() : "No expiry",
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const handleEdit = (banner: Banner) => {
    if (loading) return; // Prevent edit while loading
    navigate(`/admin/banners/create?id=${banner._id}`);
  };  

  const handleDelete = async (banner: Banner) => {
    if (window.confirm(`Are you sure you want to delete "${banner.title}"?`)) {
      try {
        const response = await deleteBanner(banner._id);
        if (response.success) {
          // Refresh the banners list
          fetchBanners(pagination.page);
        }
      } catch (err: any) {
        console.error("Error deleting banner:", err);
        setError(err.response?.data?.message || "Failed to delete banner");
      }
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      position: "",
      isActive: "",
    });
  };

  // Calculate stats from banners
  const stats = {
    total: pagination.total,
    active: banners.filter((b) => b.isActive).length,
    hero: banners.filter((b) => b.position === "hero").length,
    inactive: banners.filter((b) => !b.isActive).length,
  };

  if (loading && banners.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading banners...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Banners Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage promotional banners and advertisements
          </p>
        </div>
        <Link
          to="/admin/banners/create"
          className="inline-flex items-center justify-center sm:justify-start px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Add Banner</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
{/* Stats Cards */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div className="flex items-center">
      <Image className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 mr-3" />
      <div>
        <p className="text-xs sm:text-sm text-gray-600">Total Banners</p>
        <p className="text-lg sm:text-xl font-semibold">{stats.total}</p>
      </div>
    </div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div className="flex items-center">
      <Eye className="h-6 sm:h-8 w-6 sm:w-8 text-green-500 mr-3" />
      <div>
        <p className="text-xs sm:text-sm text-gray-600">Active Banners</p>
        <p className="text-lg sm:text-xl font-semibold">{stats.active}</p>
      </div>
    </div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div className="flex items-center">
      <Image className="h-6 sm:h-8 w-6 sm:w-8 text-purple-500 mr-3" />
      <div>
        <p className="text-xs sm:text-sm text-gray-600">Hero Banners</p>
        <p className="text-lg sm:text-xl font-semibold">{stats.hero}</p>
      </div>
    </div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div className="flex items-center">
      <EyeOff className="h-6 sm:h-8 w-6 sm:w-8 text-red-500 mr-3" />
      <div>
        <p className="text-xs sm:text-sm text-gray-600">Inactive Banners</p>
        <p className="text-lg sm:text-xl font-semibold">{stats.inactive}</p>
      </div>
    </div>
  </div>
</div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 items-start sm:items-center">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">
              Position:
            </label>
            <select
              value={filters.position}
              onChange={(e) => handleFilterChange("position", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full sm:w-auto"
            >
              <option value="">All Positions</option>
              <option value="hero">Hero</option>
              <option value="category">Category</option>
              <option value="promotion">Promotion</option>
              <option value="footer">Footer</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full sm:w-auto"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 w-full sm:w-auto"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table
          title="All Banners"
          columns={columns}
          data={banners}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pagination={pagination}
          onPageChange={(page: number | undefined) => fetchBanners(page)}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default BannersPage;