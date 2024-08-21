// app/sales/customer-info/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import CustomerDetailsModal from '@/components/crm/CustomerDetailsModal';
import { fetchCustomers } from '@/utils/supabase/customerApi';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
<<<<<<< HEAD
  phone: string;
  email: string;
  shipping_street_address1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zipcode: string;
=======
>>>>>>> c6ce44c (Customer info partially working)
}

export default function CustomerInfoPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch customers using the fetchCustomers function
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
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
    <div className="customer-info-page">
      <h1 className="text-2xl font-bold">Customer Information</h1>
      <Table aria-label="Customer table">
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>First Name</TableColumn>
          <TableColumn>Last Name</TableColumn>
<<<<<<< HEAD
          <TableColumn>Phone</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Shipping Address</TableColumn>
          <TableColumn>City</TableColumn>
          <TableColumn>State</TableColumn>
          <TableColumn>Zip Code</TableColumn>
=======
>>>>>>> c6ce44c (Customer info partially working)
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} onClick={() => setSelectedCustomer(customer)}>
              <TableCell>{customer.id}</TableCell>
              <TableCell>{customer.first_name}</TableCell>
              <TableCell>{customer.last_name}</TableCell>
<<<<<<< HEAD
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.shipping_street_address1}</TableCell>
              <TableCell>{customer.shipping_city}</TableCell>
              <TableCell>{customer.shipping_state}</TableCell>
              <TableCell>{customer.shipping_zipcode}</TableCell>
=======
>>>>>>> c6ce44c (Customer info partially working)
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedCustomer && (
        <CustomerDetailsModal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
}
