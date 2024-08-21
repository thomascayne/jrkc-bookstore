import React from 'react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, basePath }) => {
  console.log("totalPages", totalPages, "currentPage", currentPage);
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxVisiblePages = 4;

  for (let i = 1; i <= Math.min(maxVisiblePages, totalPages); i++) {
    pageNumbers.push(i);
  }

  if (totalPages > maxVisiblePages) {
    if (currentPage > 3) {
      pageNumbers[0] = 1;
      pageNumbers[1] = '...';
      for (let i = 2; i < maxVisiblePages - 1; i++) {
        pageNumbers[i] = currentPage - Math.floor(maxVisiblePages / 2) + i;
      }
    }
    if (currentPage < totalPages - 2) {
      pageNumbers[maxVisiblePages - 2] = '...';
      pageNumbers[maxVisiblePages - 1] = totalPages;
    }
  }

  const getPageUrl = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('page', page.toString());
    return `${basePath}?${searchParams.toString()}`;
  };

  return (
    <nav className="flex justify-end mt-4">
      <ul className="flex items-center space-x-2">
        <li>
          <Link href={currentPage > 1 ? getPageUrl(currentPage - 1) : '#'} 
                className={`px-2 py-1 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700'}`}>
            &lt;&lt;
          </Link>
        </li>
        {pageNumbers.map((number, index) => (
          <li key={index}>
            {number === '...' ? (
              <span className="px-2 py-1">...</span>
            ) : (
              <Link href={getPageUrl(number as any)}
                    className={`px-2 py-1 ${number === currentPage ? 'bg-blue-500 text-white' : 'text-blue-500 hover:text-blue-700'}`}>
                {number}
              </Link>
            )}
          </li>
        ))}
        <li>
          <Link href={currentPage < totalPages ? getPageUrl(currentPage + 1) : '#'}
                className={`px-2 py-1 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700'}`}>
            &gt;&gt;
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;