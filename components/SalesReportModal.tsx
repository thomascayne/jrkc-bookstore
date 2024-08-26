import React, { useEffect, useState } from 'react';
import Loading from '@/components/Loading';

interface SalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string | null;
  endDate: string | null;
  reportType: string;
}

const SalesReportModal: React.FC<SalesReportModalProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  reportType,
}) => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && startDate && endDate) {
      const loadSalesData = async () => {
        setIsLoading(true);

        // Simulate a delay to simulate network fetching/loading time
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Hardcoded sales data based on the selected report type
        const data = getSalesData(reportType);
        setSalesData(data);
        setIsLoading(false);
      };

      loadSalesData(); // Execute the function
    }
  }, [isOpen, startDate, endDate, reportType]); // Updated dependencies

  // Hardcoded book sales data for the selected report type
  const getSalesData = (type: string) => {
    switch (type) {
      case 'Daily Sales':
        return [
          { date: '2024-08-18', book_title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', quantity_sold: 10, total_sales: 150 },
          { date: '2024-08-18', book_title: '1984', author: 'George Orwell', isbn: '9780451524935', quantity_sold: 5, total_sales: 75 },
        ];
      case 'Weekly Sales':
        return [
          { date: '2024-08-12', book_title: 'Becoming', author: 'Michelle Obama', isbn: '9781524763138', quantity_sold: 7, total_sales: 210 },
          { date: '2024-08-15', book_title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', quantity_sold: 3, total_sales: 45 },
        ];
      case 'Monthly Sales':
        return [
          { date: '2024-08-01', book_title: 'Educated', author: 'Tara Westover', isbn: '9780399590504', quantity_sold: 15, total_sales: 300 },
          { date: '2024-08-05', book_title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316110', quantity_sold: 8, total_sales: 160 },
        ];
      case 'Quarterly Sales':
        return [
          { date: '2024-07-01', book_title: 'Where the Crawdads Sing', author: 'Delia Owens', isbn: '9780735219090', quantity_sold: 30, total_sales: 600 },
          { date: '2024-07-15', book_title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780061122415', quantity_sold: 25, total_sales: 500 },
        ];
      case 'Annual Sales':
        return [
          { date: '2024-01-15', book_title: 'The Power of Habit', author: 'Charles Duhigg', isbn: '9780812981605', quantity_sold: 50, total_sales: 1000 },
          { date: '2024-03-22', book_title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', quantity_sold: 40, total_sales: 800 },
        ];
      default:
        return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg relative w-3/4 h-3/4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{reportType} Report</h2>
        <button className="absolute top-4 right-4 text-red-500" onClick={onClose}>
          Close
        </button>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loading />
          </div>
        ) : (
          <table className="table-auto w-full border-collapse rounded-lg overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Book Title</th>
                <th className="px-4 py-2">Author</th>
                <th className="px-4 py-2">ISBN</th>
                <th className="px-4 py-2">Quantity Sold</th>
                <th className="px-4 py-2">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((sale, index) => (
                <tr key={index} className="bg-gray-100 text-center">
                  <td className="border px-4 py-2">{sale.date}</td>
                  <td className="border px-4 py-2">{sale.book_title}</td>
                  <td className="border px-4 py-2">{sale.author}</td>
                  <td className="border px-4 py-2">{sale.isbn}</td>
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
