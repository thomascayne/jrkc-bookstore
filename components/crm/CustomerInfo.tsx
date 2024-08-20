// Directory: /components/crm/CustomerInfo.tsx

import React, { useEffect, useState } from 'react';
import { fetchCustomerDetails } from '@/utils/supabase/customerApi'; // Function to fetch customer details
import Loading from '@/components/Loading'; // Loading component
import { UserProfile } from '@/interfaces/UserProfile'; // Use the UserProfile interface

interface CustomerInfoProps {
  customerId: string;
}

/**
 * CustomerInfo component displays basic customer information such as name, email, phone, and address.
 * @param {CustomerInfoProps} props - The props for this component, including the customerId.
 */
export default function CustomerInfo({ customerId }: CustomerInfoProps) {
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getCustomerInfo = async () => {
      try {
        const customerData = await fetchCustomerDetails(customerId); // Corrected function name
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
      <p><strong>Name:</strong> {customer.first_name} {customer.last_name}</p>
      <p><strong>Email:</strong> {customer.email}</p>
      <p><strong>Phone:</strong> {customer.phone}</p>
      <p><strong>Address:</strong> {customer.street_address1}, {customer.city}, {customer.state}, {customer.zipcode}</p>
    </div>
  );
}
