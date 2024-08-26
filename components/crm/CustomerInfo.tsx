// components/crm/CustomerInfo.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { fetchCustomers } from '@/utils/supabase/customerApi'; // Import the API method
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@nextui-org/react';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  shipping_street_address1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zipcode: string;
}

export default function CustomerInfo() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers from the API
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCustomers();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="customer-info">
      <h2 className="text-2xl font-bold">Customer Information</h2>
      <Table aria-label="Customer Details Table">
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>First Name</TableColumn>
          <TableColumn>Last Name</TableColumn>
          <TableColumn>Phone</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Shipping Address</TableColumn>
          <TableColumn>City</TableColumn>
          <TableColumn>State</TableColumn>
          <TableColumn>Zip Code</TableColumn>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.id}</TableCell>
              <TableCell>{customer.first_name}</TableCell>
              <TableCell>{customer.last_name}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.shipping_street_address1}</TableCell>
              <TableCell>{customer.shipping_city}</TableCell>
              <TableCell>{customer.shipping_state}</TableCell>
              <TableCell>{customer.shipping_zipcode}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
