import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  title: string;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
  onSearchChange?: (searchTerm: string) => void;
  loading?: boolean;
  serverSide?: boolean; // New prop to indicate server-side operations
  searchTerm?: string; // Controlled search term for server-side
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  title,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  filterable = true,
  pagination,
  onPageChange,
  onSearchChange,
  loading,
  serverSide = false,
  searchTerm: controlledSearchTerm = ''
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  // Use controlled search term for server-side, local state for client-side
  const searchTerm = serverSide ? controlledSearchTerm : localSearchTerm;

  const handleSort = (key: string) => {
    if (serverSide) {
      // For server-side sorting, you might want to add an onSortChange prop
      // For now, we'll keep local sorting for server-side tables
    }
    
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSearchChange = (value: string) => {
    if (serverSide && onSearchChange) {
      onSearchChange(value);
    } else {
      setLocalSearchTerm(value);
    }
  };

  // For server-side tables, use data as-is. For client-side, apply local filtering and sorting
  const processedData = React.useMemo(() => {
    if (serverSide) {
      return data; // Server handles filtering and sorting
    }

    let result = [...data];
    
    // Apply local search filter
    if (searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply local sorting
    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, serverSide]);

  // Show pagination if provided and has multiple pages
  const showPagination = pagination && pagination.total > pagination.limit;
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.pages || 1;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2">
            {filterable && (
              <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm">
                <Filter className="h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            )}
          </div>
        </div>
        
        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="ml-1 sm:ml-2 text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {(onEdit || onDelete || onView) && (
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} 
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                processedData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td 
                        key={column.key} 
                        className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900"
                      >
                        {column.render ? column.render(row[column.key], row) : (row[column.key] || '-')}
                      </td>
                    ))}
                    {(onEdit || onDelete || onView) && (
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          {onView && (
                            <button
                              onClick={() => onView(row)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              aria-label="View"
                            >
                              <Eye className="h-3 sm:h-4 w-3 sm:w-4" />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              aria-label="Edit"
                            >
                              <Edit className="h-3 sm:h-4 w-3 sm:w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(row)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-3 sm:h-4 w-3 sm:w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showPagination && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-gray-700">
              Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
                className="p-1 sm:p-1.5 border border-gray-300 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3 sm:h-4 w-3 sm:w-4" />
              </button>
              
              {/* Desktop pagination */}
              <div className="hidden sm:flex space-x-1 sm:space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange && onPageChange(pageNum)}
                      disabled={loading}
                      className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 py-1">...</span>
                    <button
                      onClick={() => onPageChange && onPageChange(totalPages)}
                      disabled={loading}
                      className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${
                        currentPage === totalPages
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              {/* Mobile pagination */}
              <div className="sm:hidden flex items-center space-x-1">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {currentPage} / {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
                className="p-1 sm:p-1.5 border border-gray-300 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                aria-label="Next page"
              >
                <ChevronRight className="h-3 sm:h-4 w-3 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;