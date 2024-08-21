'use client';

import React, { useEffect, useState } from 'react';
import { fetchPurchaseHistory } from '@/utils/supabase/customerApi'; // Updated import for fetching purchase history
import Loading from '@/components/Loading';

interface PurchaseHistoryProps {
  customerId: string;
}

interface Purchase {
  id: string;
  product_name: string;
  date: string;
  amount: number;
}

export default function PurchaseHistory({ customerId }: PurchaseHistoryProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerPurchases = async () => {
      try {
        setIsLoading(true);

        const data = await fetchPurchaseHistory(customerId); // Correctly fetch purchase history
        setPurchases(data || []);
      } catch (error: any) {
        console.error('Error fetching purchase history:', error.message);
        setError('Failed to fetch purchase history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerPurchases();
  }, [customerId]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!purchases.length) {
    return <p>No purchase history found.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Purchase History</h2>
      <ul>
        {purchases.map((purchase) => (
          <li key={purchase.id}>
            <strong>Product:</strong> {purchase.product_name} <br />
            <strong>Date:</strong> {purchase.date} <br />
            <strong>Amount:</strong> {purchase.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}
