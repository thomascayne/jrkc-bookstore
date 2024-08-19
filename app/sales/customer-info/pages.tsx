// app/sales/customer-info/page.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import CustomerDetails from './CustomerDetails';

export default function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*');

      if (error) {
        console.error('Error fetching customers:', error);
      } else {
        setCustomers(data);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div>
      <h1>Customer List</h1>
      {customers.length > 0 ? (
        customers.map((customer) => (
          <CustomerDetails key={customer.id} customer={customer} />
        ))
      ) : (
        <p>No customers found.</p>
      )}
    </div>
  );
}