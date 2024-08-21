import React, { useMemo } from 'react';
import { Link } from "@nextui-org/react";
import { FaTimes } from "react-icons/fa";
import { FilterOptions } from '@/utils/fetchBooksByCategory '; // Adjust the import path as needed

interface ClearFiltersButtonProps {
  filters: FilterOptions;
  onClearFilters: () => void;
}

const ClearFiltersButton: React.FC<ClearFiltersButtonProps> = ({ filters, onClearFilters }) => {
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== null && value !== '' && 
      !(Array.isArray(value) && value.length === 0)
    );
  }, [filters]);

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Link
      href="#"
      color="primary"
      onClick={onClearFilters}
      className="mb-4 w-full flex border text-small border-gray-300 items-center px-4 py-2 rounded hover:bg-gray-200"
    >
      <span>Clear Filters</span>
      <FaTimes className="ml-2" />
    </Link>
  );
};

export default ClearFiltersButton;