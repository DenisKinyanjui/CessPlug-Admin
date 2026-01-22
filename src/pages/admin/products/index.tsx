import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Package, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import Table from "../../../components/admin/Table";
import { Product, ProductStats } from "../../../types/Product";
import * as productApi from "../../../services/productApi";

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0,
    outOfStock: 0,
    featured: 0,
    newArrivals: 0,
    bestSellers: 0,
  });

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProducts = useCallback(async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page,
        limit: pagination.limit,
        ...(search && { search }),
      };

      const response = await productApi.getAllProducts(filters);
      const { products: fetchedProducts, pagination: paginationData } = response.data;

      setProducts(fetchedProducts);
      setPagination(paginationData);

      // Calculate stats from current page or fetch from API
      // For better performance, you might want to get this from the stats endpoint
      const newStats = {
        total: paginationData.total,
        active: fetchedProducts.filter((p) => p.status === "active").length,
        inactive: fetchedProducts.filter((p) => p.status === "inactive").length,
        lowStock: fetchedProducts.filter((p) => p.stock > 0 && p.stock < 20).length,
        outOfStock: fetchedProducts.filter((p) => p.stock === 0).length,
        featured: fetchedProducts.filter((p) => p.isFeatured).length,
        newArrivals: fetchedProducts.filter((p) => p.isNewArrival).length,
        bestSellers: fetchedProducts.filter((p) => p.isBestSeller).length,
      };

      setStats(newStats);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setError(err.message || "Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Fetch products when component mounts or dependencies change
  useEffect(() => {
    fetchProducts(1, debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchProducts]);

  const handlePageChange = (page: number) => {
    fetchProducts(page, debouncedSearchTerm);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const columns = [
    {
      key: "name",
      label: "Product Name",
      sortable: true,
      render: (value: string, row: Product) => (
        <div className="flex items-center">
          <img
            src={row.images?.[0] || "/placeholder-image.jpg"}
            alt={value}
            className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg object-cover mr-2 sm:mr-3"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = "/placeholder-image.jpg";
            }}
          />
          <div>
            <p className="font-medium text-gray-900 text-sm sm:text-base">{value}</p>
            <p className="text-xs sm:text-sm text-gray-500">
              {typeof row.brand === "object" ? row.brand.name : row.brand}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (value: Product["category"]) => (
        <span className="text-xs sm:text-sm">
          {typeof value === "object" && value !== null && "name" in value
            ? value.name
            : String(value ?? "")}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (value: number) => (
        <span className="text-xs sm:text-sm">Ksh {value.toFixed(2)}</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      render: (value: number) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value > 50
              ? "bg-green-100 text-green-800"
              : value > 20
              ? "bg-yellow-100 text-yellow-800"
              : value > 0
              ? "bg-orange-100 text-orange-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value} units
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : value === "inactive"
              ? "bg-gray-100 text-gray-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value: string) => (
        <span className="text-xs sm:text-sm">{new Date(value).toLocaleDateString()}</span>
      ),
    },
  ];

  const handleEdit = (product: Product) => {
    navigate(`/admin/products/create?id=${product._id}`);
  };

  const handleDelete = async (product: Product) => {
    const action =
      product.status === "active" ? "deactivate" : "permanently delete";

    if (
      window.confirm(`Are you sure you want to ${action} "${product.name}"?`)
    ) {
      try {
        const hardDelete = product.status !== "active";
        await productApi.deleteProduct(product._id, hardDelete);
        // Refresh current page
        fetchProducts(pagination.page, debouncedSearchTerm);
      } catch (err: any) {
        console.error("Failed to delete product:", err);
        setError(
          err.message || `Failed to ${action} product. Please try again.`
        );
      }
    }
  };

  const handleView = (product: Product) => {
    navigate(`/admin/products/${product._id}`);
  };

  const handleRefresh = () => {
    fetchProducts(pagination.page, debouncedSearchTerm);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4 sm:p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4 sm:p-6">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">
            Failed to load products
          </p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Products Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/products/create"
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Package className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 mr-2 sm:mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Products</p>
              <p className="text-lg sm:text-xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>
        {/* <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Package className="h-6 sm:h-8 w-6 sm:w-8 text-green-500 mr-2 sm:mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Active Products</p>
              <p className="text-lg sm:text-xl font-semibold">{stats.active}</p>
            </div>
          </div>
        </div> */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Package className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500 mr-2 sm:mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Low Stock</p>
              <p className="text-lg sm:text-xl font-semibold">{stats.lowStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Package className="h-6 sm:h-8 w-6 sm:w-8 text-red-500 mr-2 sm:mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Out of Stock</p>
              <p className="text-lg sm:text-xl font-semibold">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Products Table */}
      {products.length === 0 && !loading ? (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchTerm ? "Try adjusting your search terms." : "Get started by creating your first product."}
          </p>
          {!searchTerm && (
            <Link
              to="/admin/products/create"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            title="All Products"
            columns={columns}
            data={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            searchTerm={searchTerm}
            loading={loading}
            serverSide={true}
          />
        </div>
      )}
    </div>
  );
};

export default ProductsPage;