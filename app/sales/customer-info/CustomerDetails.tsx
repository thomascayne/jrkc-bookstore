// app/sales/customer-info/CustomerDetails.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { UserProfile } from '@/interfaces/UserProfile';

interface CustomerDetailsProps {
  customerId: string;  // Accepts only the customerId
}

const CustomerDetails = ({ customerId }: CustomerDetailsProps) => {
  const [customer, setCustomer] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) {
        console.error('Error fetching customer:', error);
      } else {
        setCustomer(data);
      }
    };

    fetchCustomer();
  }, [customerId]);

  if (!customer) return <div>Loading...</div>;

  return (
    <div>
      <h1>{customer.first_name} {customer.last_name}</h1>
      <p>Email: {customer.email}</p>
      <p>Phone: {customer.phone}</p>
      <p>Address: {customer.street_address1}, {customer.city}, {customer.state}, {customer.zipcode}</p>
      {/* Add more fields as necessary */}
    </div>
  );
};

export default CustomerDetails;
