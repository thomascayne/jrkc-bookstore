import React, { useState, useEffect } from 'react';
import { Input } from '@nextui-org/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
  containerClassName?: string;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    (searchParams && searchParams.get('q')) || '',
  );

  useEffect(() => {
    // Update the search query from the URL
    setSearchQuery((searchParams && searchParams.get('q')) || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="customer-navbar-search-form w-full">
      <Input
        startContent={<FaSearch />}
        name="search"
        value={searchQuery}
        // onChange={(e) => handleSearch(e}
        className="w-full drop-shadow-sm"
      />
    </div>
  );
}