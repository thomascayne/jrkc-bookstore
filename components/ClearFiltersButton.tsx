'use client';

import React, { useMemo } from 'react';
import { FaArrowRotateLeft } from 'react-icons/fa6';

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

  return (
    <button
      type="button"
      onClick={onClearFilters}
      aria-label="Clear all filters"
      className="flex size-8 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-default-200 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      disabled={!hasActiveFilters}
      title={hasActiveFilters ? 'Clear all filters' : 'No active filters'}
    >
      <FaArrowRotateLeft aria-hidden="true" />
    </button>
  );
};

export default ClearFiltersButton;
