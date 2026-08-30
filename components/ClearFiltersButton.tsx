'use client';

import React, { useMemo } from 'react';
import { FaTimes } from 'react-icons/fa';

import type { FilterOptions } from '@/utils/catalogFilters';

interface ClearFiltersButtonProps {
  filters: FilterOptions;
  onClearFilters: () => void;
}

const ClearFiltersButton: React.FC<ClearFiltersButtonProps> = ({
  filters,
  onClearFilters,
}) => {
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0),
    );
  }, [filters]);

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClearFilters}
      className="mb-4 flex w-full cursor-pointer items-center rounded border border-divider px-4 py-2 text-small text-foreground transition-colors hover:bg-default-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span>Clear Filters</span>
      <FaTimes className="ml-2" />
    </button>
  );
};

export default ClearFiltersButton;
