import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { UserProfile } from '@/interfaces/UserProfile';

export default function CustomerList() {
  const [customers, setCustomers] = useState<UserProfile[]>([]); // Explicitly typing the state

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*');

      if (error) {
        console.error('Error fetching customers:', error);
      } else {
        setCustomers(data || []); // Now TypeScript knows this is an array of UserProfile
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div>
      <h2>Customer List</h2>
      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>
            {customer.first_name} {customer.last_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
