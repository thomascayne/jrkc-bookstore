// Directory: app/sales/customer-info/PurchaseHistory.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { fetchPurchaseHistory } from '@/utils/supabase/customerApi'; // Importing the correct API call to fetch purchase history
import Loading from '@/components/Loading'; // Importing the Loading component

// Define the properties of the PurchaseHistory component
interface PurchaseHistoryProps {
  customerId: string; // The ID of the customer whose purchase history we want to load
}

// Define the structure of a single purchase history item
interface PurchaseHistoryItem {
  title: string;
  authors: string;
  isbn13: string;
  description: string;
  quantity: number;
  purchase_date: string; // Date as a string
  price: number;
  list_price: number;
  discount_percentage: number;
  category_id: number;
  publisher: string;
  published_date: string;
  thumbnail_image_link: string;
}

// The PurchaseHistory component that fetches and displays the purchase history for a specific customer
const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ customerId }) => {
  // State to store the fetched purchase history
  const [history, setHistory] = useState<PurchaseHistoryItem[]>([]);
  // State to track whether the data is being loaded
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // useEffect to fetch the purchase history when the component mounts or when the customerId changes
  useEffect(() => {
    const loadPurchaseHistory = async () => {
      try {
        setIsLoading(true); // Set loading to true while fetching data
        const data = await fetchPurchaseHistory(customerId); // Fetch the purchase history from the Supabase API using .rpc
        setHistory(data); // Set the fetched data to the state
      } catch (error) {
        console.error('Failed to fetch purchase history:', error); // Log any errors that occur
      } finally {
        setIsLoading(false); // Stop loading once the data is fetched
      }
    };

    loadPurchaseHistory(); // Call the function to fetch the data
  }, [customerId]); // Only re-run the effect if customerId changes

  // Display the loading spinner if data is still being fetched
  if (isLoading) {
    return <Loading containerClass="h-32 w-32" position="absolute" />;
  }

  // If no purchase history is available, display a message
  if (!history || history.length === 0) {
    return <p>No purchase history available.</p>;
  }

  // Render the purchase history table
  return (
    <div className="purchase-history">
      <h2 className="text-xl font-bold mb-4">Purchase History</h2>
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {history.map((purchase, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{new Date(purchase.purchase_date).toLocaleDateString()}</td>
              <td className="border px-4 py-2">{purchase.title}</td>
              <td className="border px-4 py-2">${purchase.price.toFixed(2)}</td>
              <td className="border px-4 py-2">{purchase.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseHistory;
