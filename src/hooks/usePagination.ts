import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

interface UsePaginationReturn<T> {
  // Current page data
  currentData: T[];
  
  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  
  // Navigation
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // Page size
  setPageSize: (size: number) => void;
  pageSizeOptions: number[];
  
  // Status
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  
  // Range info (e.g., "1-10 of 100")
  startIndex: number;
  endIndex: number;
}

/**
 * usePagination - Generic pagination hook for any data array
 * 
 * @param data - The full array of data to paginate
 * @param options - Pagination configuration options
 * @returns Pagination state and controls
 */
export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page is within bounds
  const validCurrentPage = useMemo(() => {
    if (currentPage < 1) return 1;
    if (currentPage > totalPages) return totalPages;
    return currentPage;
  }, [currentPage, totalPages]);

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, validCurrentPage, pageSize]);

  // Calculate range indices
  const startIndex = (validCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(validCurrentPage * pageSize, totalItems);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (validCurrentPage < totalPages) {
      setCurrentPage(validCurrentPage + 1);
    }
  }, [validCurrentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (validCurrentPage > 1) {
      setCurrentPage(validCurrentPage - 1);
    }
  }, [validCurrentPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // Page size change (reset to first page)
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  // Status flags
  const hasNextPage = validCurrentPage < totalPages;
  const hasPrevPage = validCurrentPage > 1;
  const isFirstPage = validCurrentPage === 1;
  const isLastPage = validCurrentPage === totalPages;

  return {
    currentData,
    currentPage: validCurrentPage,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    setPageSize,
    pageSizeOptions,
    hasNextPage,
    hasPrevPage,
    isFirstPage,
    isLastPage,
    startIndex: totalItems === 0 ? 0 : startIndex,
    endIndex,
  };
}
