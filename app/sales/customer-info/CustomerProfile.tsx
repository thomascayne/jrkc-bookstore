'use client';

import React, { useEffect, useState } from 'react';
import { fetchCustomerDetails } from '@/utils/supabase/customerApi'; // Corrected import for fetching customer details
import Loading from '@/components/Loading';

interface CustomerProfileProps {
  customerId: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function CustomerProfile({ customerId }: CustomerProfileProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCustomerDetails = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCustomerDetails(customerId); // Correctly pass customerId
        setCustomer(data);
      } catch (error: any) {
        console.error('Error fetching customer details:', error.message);
        setError('Failed to fetch customer details');
      } finally {
        setIsLoading(false);
      }
    };

    getCustomerDetails();
  }, [customerId]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!customer) {
    return <p>No customer found.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Customer Profile</h2>
      <p>
        <strong>ID:</strong> {customer.id}
      </p>
      <p>
        <strong>Name:</strong> {customer.first_name} {customer.last_name}
      </p>
      <p>
        <strong>Email:</strong> {customer.email}
      </p>
    </div>
  );
}
