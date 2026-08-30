import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  catalogFiltersFromSearchParams,
  type FilterOptions,
} from '@/utils/catalogFilters';

export const useUrlSync = (
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>,
) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    setFilters(catalogFiltersFromSearchParams(searchParams));
  }, [searchParams, setFilters]);
};
