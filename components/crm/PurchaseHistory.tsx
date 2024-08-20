// components/crm/PurchaseHistory.tsx

import React, { useEffect, useState } from 'react';
import { fetchCustomerDetails } from '@/utils/supabase/customerApi'; // Corrected import for fetching purchase history
import Loading from '@/components/Loading'; // Corrected import for Loading component

interface PurchaseHistoryProps {
  customerId: string;
}

/**
 * PurchaseHistory component displays a list of previous purchases made by a customer.
 * @param {PurchaseHistoryProps} props - The props for this component, including the customerId.
 */
const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ customerId }) => {
  const [history, setHistory] = useState<any[]>([]); // Storing purchase history
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getPurchaseHistory = async () => {
      try {
        const purchaseHistoryData = await fetchCustomerDetails(customerId); // Fetching purchase history using customerId
        setHistory(purchaseHistoryData);
      } catch (error) {
        console.error('Error fetching purchase history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getPurchaseHistory();
  }, [customerId]);

  if (isLoading) {
    return <Loading containerClass="w-full h-full" />;
  }

  if (!history.length) {
    return <p>No purchase history available.</p>;
  }

  return (
    <div className="purchase-history">
      <h2 className="text-lg font-bold">Purchase History</h2>
      <ul>
        {history.map((purchase) => (
          <li key={purchase.id} className="mb-2">
            <p><strong>Product:</strong> {purchase.product_name}</p>
            <p><strong>Amount:</strong> ${purchase.amount.toFixed(2)}</p>
            <p><strong>Date:</strong> {new Date(purchase.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PurchaseHistory;
