import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, AlertCircle, Loader2 } from "lucide-react";
import BasicInfoForm from "../../../components/admin/products/BasicInfoForm";
import ProductSpecsForm from "../../../components/admin/products/ProductSpecsForm";
import ProductImagesForm from "../../../components/admin/products/ProductImagesForm";
import ProductFormActions from "../../../components/admin/products/ProductFormActions";
import axiosInstance from "../../../utils/axiosInstance";
import * as productApi from "../../../services/productApi";

// Types for API responses
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  _id: string;
  name: string;
  slug: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface CategoriesResponse {
  categories: Category[];
}

interface BrandsResponse {
  brands: Brand[];
}

interface ProductResponse {
  product: any;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  brand: string;
  stock: number;
  tags: string[];
  images: string[];
  specifications: { [key: string]: string };
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  status: "active" | "inactive";
}

// Custom hook for API data fetching with proper cleanup and admin auth
const useApiData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const maxRetries = 3;
  const retryDelay = 1000;

  const fetchData = useCallback(async (retry = false) => {
    if (!isMountedRef.current) return;

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      if (!retry) {
        setLoading(true);
        setError(null);
      }

      // Add admin authentication to requests
      const [categoriesResponse, brandsResponse] = await Promise.all([
        axiosInstance.get<ApiResponse<CategoriesResponse>>("/categories", {
          signal,
          isAdmin: true, // Add admin flag
        }),
        axiosInstance.get<ApiResponse<BrandsResponse>>("/brands", { 
          signal,
          isAdmin: true, // Add admin flag
        }),
      ]);

      if (!isMountedRef.current) return;

      if (categoriesResponse.data.success && categoriesResponse.data.data) {
        setCategories(categoriesResponse.data.data.categories);
      } else {
        throw new Error(
          categoriesResponse.data.message || "Failed to fetch categories"
        );
      }

      if (brandsResponse.data.success && brandsResponse.data.data) {
        setBrands(brandsResponse.data.data.brands);
      } else {
        throw new Error(
          brandsResponse.data.message || "Failed to fetch brands"
        );
      }

      setError(null);
      setRetryCount(0);
    } catch (err: any) {
      if (!isMountedRef.current) return;

      if (err.name === "AbortError") {
        return;
      }

      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch data";
      console.error("API Error:", errorMessage);

      if (retryCount < maxRetries) {
        setTimeout(() => {
          if (isMountedRef.current) {
            setRetryCount((prev) => prev + 1);
          }
        }, retryDelay * (retryCount + 1));
      } else {
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [retryCount]);

  useEffect(() => {
    if (retryCount > 0 && retryCount <= maxRetries) {
      fetchData(true);
    }
  }, [retryCount, fetchData]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return { categories, brands, loading, error, refetch: () => fetchData() };
};

const Toast: React.FC<{
  message: string;
  type: "success" | "error";
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      <div className="flex items-center space-x-2">
        {type === "error" && <AlertCircle className="w-5 h-5" />}
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setHasError(true);
      setError(new Error(error.message));
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      )
    );
  }

  return <>{children}</>;
};

const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");
  const isEdit = Boolean(productId);

  const {
    categories,
    brands,
    loading: dataLoading,
    error: dataError,
    refetch,
  } = useApiData();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [initialProductData, setInitialProductData] = useState<any>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    brand: "",
    stock: 0,
    tags: [],
    images: [],
    specifications: {},
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    status: "active",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [tagInput, setTagInput] = useState("");

  // Helper function to extract ID from object or return string
  const extractId = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && value._id) return value._id;
    if (value && typeof value === 'object' && value.id) return value.id;
    return '';
  };

  // Helper function to process specifications
  const processSpecifications = (specs: any): { [key: string]: string } => {
    if (!specs) return {};
    
    // If it's already an object with string values, return as is
    if (typeof specs === 'object' && !Array.isArray(specs)) {
      const processed: { [key: string]: string } = {};
      Object.entries(specs).forEach(([key, value]) => {
        processed[key] = String(value || '');
      });
      return processed;
    }
    
    // If it's an array of objects with name/value pairs
    if (Array.isArray(specs)) {
      const processed: { [key: string]: string } = {};
      specs.forEach((spec: any) => {
        if (spec.name && spec.value !== undefined) {
          processed[spec.name] = String(spec.value);
        }
      });
      return processed;
    }
    
    return {};
  };

  // Load product data for edit mode
  useEffect(() => {
    if (isEdit && productId && !productLoading && !initialProductData) {
      const fetchProduct = async () => {
        try {
          setProductLoading(true);
          setProductLoadError(null);
          
          console.log(`Fetching product with ID: ${productId}`);
          
          // Use the productApi service instead of direct axios call
          const response = await productApi.getProductById(productId);
          
          if (response.success && response.data && response.data.product) {
            const product = response.data.product;
            console.log('Fetched product data:', product);
            setInitialProductData(product);
          } else {
            throw new Error(response.message || "Failed to fetch product");
          }
        } catch (err: any) {
          console.error("Error fetching product:", err);
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to fetch product for editing";
          
          setProductLoadError(errorMessage);
          setToast({ message: errorMessage, type: "error" });
        } finally {
          setProductLoading(false);
        }
      };

      fetchProduct();
    }
  }, [isEdit, productId, initialProductData, productLoading]);

  // Populate form data when product is loaded
  useEffect(() => {
    if (initialProductData && isEdit) {
      console.log('Populating form with product data:', initialProductData);
      
      const populatedData: ProductFormData = {
        name: initialProductData.name || "",
        slug: initialProductData.slug || "",
        description: initialProductData.description || "",
        price: Number(initialProductData.price) || 0,
        originalPrice: Number(initialProductData.originalPrice) || 0,
        category: extractId(initialProductData.category),
        brand: extractId(initialProductData.brand),
        stock: Number(initialProductData.stock) || 0,
        tags: Array.isArray(initialProductData.tags) ? initialProductData.tags : [],
        images: Array.isArray(initialProductData.images) ? initialProductData.images : [],
        specifications: processSpecifications(
          initialProductData.specifications || 
          initialProductData.specs || 
          {}
        ),
        isFeatured: Boolean(initialProductData.isFeatured),
        isNewArrival: Boolean(initialProductData.isNewArrival),
        isBestSeller: Boolean(initialProductData.isBestSeller),
        status: initialProductData.status || "active",
      };
      
      console.log('Setting form data:', populatedData);
      setFormData(populatedData);
      
      // Clear any existing errors when loading edit data
      setErrors({});
      setSubmitError(null);
    }
  }, [initialProductData, isEdit]);

  const handleFieldChange = useCallback(
    (field: keyof ProductFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }

      if (field === "name" && typeof value === "string") {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        setFormData((prev) => ({
          ...prev,
          slug,
        }));
      }
    },
    [errors]
  );

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      console.log("Selected category ID:", categoryId);
      setFormData((prev) => ({
        ...prev,
        category: categoryId,
      }));

      if (errors.category) {
        setErrors((prev) => ({
          ...prev,
          category: "",
        }));
      }
    },
    [errors.category]
  );

  const handleSpecificationChange = useCallback(
    (specifications: { [key: string]: string }) => {
      setFormData((prev) => ({
        ...prev,
        specifications,
      }));
    },
    []
  );

  const handleTagInputChange = useCallback((value: string) => {
    setTagInput(value);
  }, []);

  const handleTagInput = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag)) {
          setFormData((prev) => ({
            ...prev,
            tags: [...prev.tags, tag],
          }));
        }
        setTagInput("");
      }
    },
    [tagInput, formData.tags]
  );

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  const handleImageUpload = useCallback((imageUrls: string[]) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
    }));
  }, []);

  const extractPublicIdFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const uploadIndex = pathParts.indexOf('upload');
      if (uploadIndex > -1 && pathParts.length > uploadIndex + 2) {
        return pathParts.slice(uploadIndex + 2).join('/').replace(/\..+$/, '');
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleRemoveImage = useCallback(async (index: number) => {
    const imageToRemove = formData.images[index];
    
    try {
      const publicId = extractPublicIdFromUrl(imageToRemove);
      if (publicId) {
        await axiosInstance.delete('/upload', { 
          data: { publicId },
          isAdmin: true,
        });
      }
      
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } catch (error) {
      console.error('Error removing image from Cloudinary:', error);
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  }, [formData.images]);

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.brand) newErrors.brand = "Brand is required";
    if (formData.stock < 0) newErrors.stock = "Stock cannot be negative";
    if (formData.images.length === 0) newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      setToast({ message: "Please fix the errors above", type: "error" });
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      // Check if admin token exists
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin authentication required. Please login as admin.');
      }

      // Prepare specifications data - convert object to array format expected by API
      const specificationsArray = Object.entries(formData.specifications).map(
        ([name, value]) => ({ name, value })
      );

      const apiData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price.toString()),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice.toString())
          : undefined,
        category: formData.category,
        brand: formData.brand,
        stock: parseInt(formData.stock.toString()),
        tags: formData.tags,
        images: formData.images,
        specifications: specificationsArray,
        specs: formData.specifications, // Also send as key-value for new format
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
        status: formData.status,
      };

      console.log('Submitting product data:', apiData);

      let response;
      if (isEdit && productId) {
        // Update existing product
        console.log(`Updating product with ID: ${productId}`);
        response = await productApi.updateProduct(productId, apiData);
      } else {
        // Create new product
        console.log('Creating new product');
        response = await productApi.createProduct(apiData);
      }

      if (response.success) {
        setToast({
          message: isEdit
            ? "Product updated successfully!"
            : "Product created successfully!",
          type: "success",
        });

        setTimeout(() => {
          navigate("/admin/products");
        }, 1500);
      } else {
        throw new Error(response.message || "Failed to save product");
      }
    } catch (error: any) {
      let errorMessage = "Failed to save product";
      
      if (error.response?.status === 401) {
        errorMessage = "Admin authentication failed. Please login as admin and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSubmitError(errorMessage);
      setToast({ message: errorMessage, type: "error" });
      console.error("Error submitting product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = useCallback(() => {
    navigate("/admin/products");
  }, [navigate]);

  // Show loading state
  if (dataLoading || (isEdit && productLoading)) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg text-gray-600">
            {dataLoading
              ? "Loading categories and brands..."
              : "Loading product data..."}
          </span>
        </div>
      </div>
    );
  }

  // Show error state for data loading
  if (dataError) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Data
          </h2>
          <p className="text-gray-600 mb-4">{dataError}</p>
          <div className="flex space-x-4">
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for product loading in edit mode
  if (isEdit && productLoadError) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Product
          </h2>
          <p className="text-gray-600 mb-4">{productLoadError}</p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setProductLoadError(null);
                setInitialProductData(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto space-y-6">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit
                ? `Update product information ${initialProductData?.name ? `for "${initialProductData.name}"` : ''}`
                : "Create a new product for your store"}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{submitError}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <BasicInfoForm
            formData={formData}
            categories={categories}
            brands={brands}
            errors={errors}
            loading={submitting}
            tagInput={tagInput}
            onFieldChange={handleFieldChange}
            onCategoryChange={handleCategoryChange}
            onTagInputChange={handleTagInputChange}
            onTagInput={handleTagInput}
            onRemoveTag={handleRemoveTag}
          />

          <ProductSpecsForm
            formData={formData}
            errors={errors}
            loading={submitting}
            onSpecificationChange={handleSpecificationChange}
          />

          <ProductImagesForm
            formData={formData}
            loading={submitting}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
          />

          <ProductFormActions
            loading={submitting}
            isEdit={isEdit}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CreateProductPage;