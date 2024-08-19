// app/sales/customer-info/PurchaseHistory.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';

interface Purchase {
  id: string;
  product_name: string;
  purchase_date: string;
}

export default function PurchaseHistory({ customerId }: { customerId: string }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      const { data, error } = await supabase
        .from('purchase_history')
        .select('*')
        .eq('customer_id', customerId);

      if (error) {
        console.error('Error fetching purchase history:', error);
      } else {
        setPurchases(data);
      }
    };

    fetchPurchaseHistory();
  }, [customerId]);

  return (
    <div>
      <h3>Purchase History</h3>
      {purchases.length > 0 ? (
        <ul>
          {purchases.map((purchase) => (
            <li key={purchase.id}>
              {purchase.product_name} - {purchase.purchase_date}
            </li>
          ))}
        </ul>
      ) : (
        <p>No purchase history available.</p>
      )}
    </div>
  );
}