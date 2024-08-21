// Directory: /components/crm/SalesReportModal.tsx

import React, { useEffect, useState } from 'react';
import { fetchSalesData } from '@/utils/supabase/salesApi'; // Ensure you fetch from the correct API
import Loading from '@/components/Loading';

interface SalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
}

/**
 * SalesReportModal component fetches and displays sales data in a table.
 * @param isOpen - Boolean to determine if the modal is open.
 * @param onClose - Function to close the modal.
 * @param startDate - Start date for the sales report.
 * @param endDate - End date for the sales report.
 */
const SalesReportModal: React.FC<SalesReportModalProps> = ({ isOpen, onClose, startDate, endDate }) => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Fetch sales data when the modal is opened
      const loadSalesData = async () => {
        setIsLoading(true);
        try {
          const data = await fetchSalesData(startDate, endDate); // Fetch sales data
          setSalesData(data);
        } catch (error) {
          console.error('Error fetching sales data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadSalesData();
    }
  }, [isOpen, startDate, endDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow-lg relative w-3/4 h-3/4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Sales Report</h2>
        <button className="absolute top-4 right-4 text-red-500" onClick={onClose}>
          Close
        </button>
        {isLoading ? (
          <Loading />
        ) : (
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Quantity Sold</th>
                <th className="px-4 py-2">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((sale, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{sale.date}</td>
                  <td className="border px-4 py-2">{sale.product_name}</td>
                  <td className="border px-4 py-2">{sale.quantity_sold}</td>
                  <td className="border px-4 py-2">${sale.total_sales.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SalesReportModal;
