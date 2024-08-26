// components/crm/PurchaseHistory.tsx
// Component to display purchase history for a given customer

import React, { useState, useEffect } from 'react';
import { fetchPurchaseHistory } from '@/utils/supabase/customerApi'; // Import the correct RPC function for fetching purchase history
import Loading from '@/components/Loading';

interface PurchaseHistoryProps {
  customerId: string;
}

// Define the structure of a purchase history item to match your table
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

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ customerId }) => {
  const [history, setHistory] = useState<PurchaseHistoryItem[]>([]); // Set the type for history array
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch purchase history from Supabase using the .rpc protocol
  useEffect(() => {
    const loadPurchaseHistory = async () => {
      try {
        setIsLoading(true); // Show loading state
        const data = await fetchPurchaseHistory(customerId); // Fetch the purchase history for the given customer
        setHistory(data); // Set the fetched data to history
      } catch (error) {
        console.error('Failed to fetch purchase history:', error); // Log any errors
      } finally {
        setIsLoading(false); // Hide loading state
      }
    };

    loadPurchaseHistory();
  }, [customerId]); // Re-fetch data when customerId changes

  // Display a loading spinner while the data is loading
  if (isLoading) {
    return <Loading />;
  }

  // If no history is available, show a message
  if (history.length === 0) {
    return <p>No purchase history available.</p>;
  }

  // Render the purchase history list
  return (
    <div className="purchase-history">
      <h2 className="text-xl font-bold">Purchase History</h2>
      <ul>
        {history.map((purchase, index) => (
          <li key={index} className="border-b pb-4 mb-4">
            <div className="flex">
              <img
                src={purchase.thumbnail_image_link} // Display thumbnail image
                alt={purchase.title}
                className="w-20 h-28 mr-4"
              />
              <div>
                <p><strong>Title:</strong> {purchase.title}</p>
                <p><strong>Authors:</strong> {purchase.authors}</p>
                <p><strong>ISBN-13:</strong> {purchase.isbn13}</p>
                <p><strong>Description:</strong> {purchase.description}</p>
                <p><strong>Quantity:</strong> {purchase.quantity}</p>
                <p><strong>Purchase Date:</strong> {new Date(purchase.purchase_date).toLocaleDateString()}</p>
                <p><strong>Price:</strong> ${purchase.price.toFixed(2)}</p>
                <p><strong>List Price:</strong> ${purchase.list_price.toFixed(2)}</p>
                <p><strong>Discount:</strong> {purchase.discount_percentage}%</p>
                <p><strong>Publisher:</strong> {purchase.publisher}</p>
                <p><strong>Published Date:</strong> {new Date(purchase.published_date).toLocaleDateString()}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
