import React from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from 'react-icons/fa';

interface BookPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  onPageChange: (page: number) => void;
  onNextPageHover: () => void;
}

const BookPagination: React.FC<BookPaginationProps> = ({
  currentPage,
  totalPages,
  basePath,
  onPageChange,
  onNextPageHover,
}) => {
  if (totalPages <= 1) return null;

  const handlePageClick = (page: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    onPageChange(page);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li
          key={i}
          className={`inline-block mx-1 ${i === currentPage ? 'font-bold' : ''}`}
        >
          <a
            href="#"
            onClick={handlePageClick(i)}
            className={`px-2 py-2 border rounded ${i === currentPage ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
          >
            {i}
          </a>
        </li>,
      );
    }

    return pageNumbers;
  };

  return (
    <nav className="flex justify-center mt-4">
      <ul className="flex items-center space-x-1">
        <li className="flex">
          <a
            href="#"
            onClick={handlePageClick(1)}
            className={`px-2 py-1 border rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'}`}
          >
            <FaAngleDoubleLeft />
          </a>
        </li>
        <li className="flex">
          <a
            href="#"
            onClick={handlePageClick(Math.max(1, currentPage - 1))}
            className={`px-2 py-1 border rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'}`}
          >
            <FaChevronLeft />
          </a>
        </li>
        {renderPageNumbers()}
        <li className="flex">
          <a
            href="#"
            onClick={handlePageClick(Math.min(totalPages, currentPage + 1))}
            onMouseEnter={onNextPageHover}
            className={`px-2 py-1 border rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'}`}
          >
            <FaChevronRight />
          </a>
        </li>
        <li className="flex">
          <a
            href="#"
            onClick={handlePageClick(totalPages)}
            className={`px-2 py-1 border rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'}`}
          >
            <FaAngleDoubleRight />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default BookPagination;
