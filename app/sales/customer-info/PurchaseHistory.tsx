// app/sales/customer-info/PurchaseHistory.tsx

import React, { useEffect, useState } from 'react';
import { fetchPurchaseHistory } from '@/utils/supabase/purchaseApi'; // Importing the function from the purchase API
import Loading from '@/components/Loading'; // Updated the correct path for Loading component

interface PurchaseHistoryProps {
  customerId: string; // Explicitly defining the type for customerId
}

/**
 * PurchaseHistory component fetches and displays the purchase history of a customer.
 * @param customerId - The ID of the customer whose purchase history is being fetched.
 */
export default function PurchaseHistory({ customerId }: PurchaseHistoryProps) {
  const [history, setHistory] = useState<any[] | null>(null); // Properly typing state
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Fetch purchase history when component mounts or customerId changes
  useEffect(() => {
    async function loadPurchaseHistory() {
      const purchaseHistory = await fetchPurchaseHistory(customerId); // Fetching purchase history
      setHistory(purchaseHistory); // Set fetched history
      setIsLoading(false); // Stop loading once data is fetched
    }

    loadPurchaseHistory();
  }, [customerId]);

  // If still loading, show the Loading component
  if (isLoading) {
    return <Loading containerClass="h-32 w-32" position="absolute" />;
  }

  // If there's no purchase history, show a message
  if (!history || history.length === 0) {
    return <p>No purchase history available.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Purchase History</h2>
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {history.map((purchase: any, index: number) => ( // Properly typing purchase
            <tr key={index}>
              <td className="border px-4 py-2">{purchase.date}</td>
              <td className="border px-4 py-2">{purchase.product_name}</td>
              <td className="border px-4 py-2">{purchase.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
