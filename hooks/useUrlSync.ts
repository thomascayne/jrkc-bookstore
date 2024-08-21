import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterOptions } from '@/utils/fetchBooksByCategory ';

export const useUrlSync = (
  filters: FilterOptions,
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>
) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleRouteChange = () => {
      const newFilters: FilterOptions = {};
      if (!searchParams) return;
      
      searchParams.forEach((value, key) => {
        if (key === 'price') {
          const [min, max] = value.split(',').map(Number);
          newFilters.price = { min, max };
        } else if (key === 'in_stock') {
          newFilters.in_stock = value === 'true';
        } else if (key === 'rating_min' || key === 'discount_percentage_min') {
          newFilters[key] = Number(value);
        } else if (key === 'sort_by') {
          newFilters.sort_by = value as 'discount_percentage' | 'price' | 'average_rating';
        } else if (key === 'sort_order') {
          newFilters.sort_order = value as 'ASC' | 'DESC';
        }
        // Add other filter types as needed
      });
      setFilters(newFilters);
    };

    handleRouteChange(); // Initial call to set filters from URL
  }, [searchParams, setFilters]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'price' && typeof value === 'object') {
          params.set(key, `${value.min},${value.max}`);
        } else {
          params.set(key, value.toString());
        }
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [filters, router]);
};