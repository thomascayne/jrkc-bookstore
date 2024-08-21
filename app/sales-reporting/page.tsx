// Directory: /app/admin/sales-reporting/page.tsx

'use client';

import React, { useState } from 'react';
import SalesReportModal from '@/components/crm/SalesReportModal';

export default function SalesReportingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportRange, setReportRange] = useState({ startDate: '', endDate: '' });

  const openReport = (range: { startDate: string; endDate: string }) => {
    setReportRange(range);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Sales Reporting</h1>
      <div className="flex gap-4">
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={() => openReport({ startDate: '2023-09-01', endDate: '2023-09-01' })}
        >
          Daily Sales
        </button>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={() => openReport({ startDate: '2023-09-01', endDate: '2023-09-07' })}
        >
          Weekly Sales
        </button>
      </div>

      {isModalOpen && (
        <SalesReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          startDate={reportRange.startDate}
          endDate={reportRange.endDate}
        />
      )}
    </div>
  );
}
