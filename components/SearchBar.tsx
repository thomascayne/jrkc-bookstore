import React, { useState, useEffect } from 'react';
import { Input } from "@nextui-org/react";
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
  containerClassName?: string;
}

export default function SearchBar({ onSearch, className = '', containerClassName = '' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams && searchParams.get('q') || '');

  useEffect(() => {
    // Update the search query from the URL
    setSearchQuery(searchParams && searchParams.get('q') || '');
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
    <form onSubmit={handleSearch} className={`w-full ${containerClassName}`}>
      <Input
      startContent={<FaSearch />}
        name="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-xs"
        classNames={{
          base: "max-w-full sm:max-w-[10rem] h-10",
          mainWrapper: "h-full",
          input: "text-small",
          inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
        }}
      />
    </form>
  );
}