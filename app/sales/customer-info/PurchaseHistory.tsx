import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

interface Purchase {
  id: string;
  product_name: string;
  purchase_date: string;
}

export default function PurchaseHistory({ customerId }: { customerId: string }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]); // Explicitly typing the state

  useEffect(() => {
    const fetchPurchases = async () => {
      const { data, error } = await supabase
        .from('purchase_history')
        .select('*')
        .eq('customer_id', customerId);

      if (error) {
        console.error('Error fetching purchase history:', error);
      } else {
        setPurchases(data || []); // TypeScript now knows this is an array of Purchase
      }
    };

    fetchPurchases();
  }, [customerId]);

  return (
    <div>
      <h4>Purchase History</h4>
      {purchases.map((purchase) => (
        <div key={purchase.id}>
          {purchase.product_name} - {purchase.purchase_date}
        </div>
      ))}
    </div>
  );
}
