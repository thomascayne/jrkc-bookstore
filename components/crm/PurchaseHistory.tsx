// components/crm/PurchaseHistory.tsx

import React, { useState, useEffect } from 'react';
import { fetchPurchaseHistory } from '@/utils/supabase/customerApi'; // Correct import for fetching purchase history
import Loading from '@/components/Loading';

interface PurchaseHistoryProps {
  customerId: string;
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ customerId }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPurchaseHistory = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPurchaseHistory(customerId);
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch purchase history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchaseHistory();
  }, [customerId]);

  if (isLoading) {
    return <Loading />;
  }

  if (history.length === 0) {
    return <p>No purchase history available.</p>;
  }

  return (
    <div className="purchase-history">
      <h2 className="text-xl font-bold">Purchase History</h2>
      <ul>
        {history.map((purchase, index) => (
          <li key={index}>
            <p><strong>Product:</strong> {purchase.product_name}</p>
            <p><strong>Date:</strong> {purchase.purchase_date}</p>
            <p><strong>Price:</strong> ${purchase.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PurchaseHistory;
