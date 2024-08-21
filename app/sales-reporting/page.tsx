'use client';

import React, { useState } from 'react';
import SalesReportModal from '@/components/SalesReportModal';

const SalesReportingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [reportType, setReportType] = useState<string>(''); // Track which report is selected

  const openModal = (type: string, start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setReportType(type); // Set report type for modal header
    setIsOpen(true);
  };

  const buttonStyle = "px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 ease-in-out";

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Sales Reporting</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <button
          className={buttonStyle}
          onClick={() => openModal('Daily Sales', '2024-08-18', '2024-08-18')}
        >
          Daily Sales
        </button>
        <button
          className={buttonStyle}
          onClick={() => openModal('Weekly Sales', '2024-08-12', '2024-08-18')}
        >
          Weekly Sales
        </button>
        <button
          className={buttonStyle}
          onClick={() => openModal('Monthly Sales', '2024-08-01', '2024-08-31')}
        >
          Monthly Sales
        </button>
        <button
          className={buttonStyle}
          onClick={() => openModal('Quarterly Sales', '2024-07-01', '2024-09-30')}
        >
          Quarterly Sales
        </button>
        <button
          className={buttonStyle}
          onClick={() => openModal('Annual Sales', '2024-01-01', '2024-12-31')}
        >
          Annual Sales
        </button>
      </div>

      <SalesReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        startDate={startDate || ''}
        endDate={endDate || ''}
        reportType={reportType} // Pass the report type to modal
      />
    </div>
  );
};

export default SalesReportingPage;
