//Directory: app\sales\customer-info\CustomerProfile.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { fetchCustomerDetails } from '@/utils/supabase/customerApi'; // Fetching customer details
import Loading from '@/components/Loading';

interface CustomerProfileProps {
  customerId: string;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ customerId }) => {
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getCustomerInfo = async () => {
      try {
        const customerData = await fetchCustomerDetails(customerId);
        setCustomer(customerData);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getCustomerInfo();
  }, [customerId]);

  if (isLoading) {
    return <Loading containerClass="w-full h-full" />;
  }

  if (!customer) {
    return <p>No customer data available.</p>;
  }

  return (
    <div className="customer-info">
      <h2 className="text-lg font-bold">Customer Information</h2>
      <p><strong>Name:</strong> {customer.name}</p>
      <p><strong>Email:</strong> {customer.email}</p>
      <p><strong>Phone:</strong> {customer.phone}</p>
      <p><strong>Address:</strong> {customer.address}</p>
    </div>
  );
};

export default CustomerProfile;
