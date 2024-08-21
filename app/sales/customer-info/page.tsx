//Directory: app/sales/customer-info/page.tsx

'use client'; // Marks this component as a Client Component

import React, { useState, useEffect } from 'react';
import CustomerDetailsModal from '@/components/crm/CustomerDetailsModal';
import { fetchAllCustomers } from '@/utils/supabase/customerApi';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function CustomerInfoPage() {
  const [customers, setCustomers] = useState<Customer[]>([]); // Explicitly typing customers as an array of Customer objects
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null); // Typing selectedCustomer as Customer or null

  useEffect(() => {
    const getCustomers = async () => {
      const data: Customer[] = await fetchAllCustomers(); // Assuming fetchAllCustomers returns an array of Customer objects
      setCustomers(data); // Set state with typed data
    };
    getCustomers();
  }, []);

  return (
    <div>
      <h1>Customer Information Page</h1>
      {/* Mapping over customers with proper typing */}
      {customers.map((customer) => (
        <div key={customer.id} onClick={() => setSelectedCustomer(customer)}>
          <p>{customer.name}</p>
        </div>
      ))}

      {/* Rendering the modal if a customer is selected */}
      {selectedCustomer && (
        <CustomerDetailsModal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          customer={selectedCustomer} // Passing the selected customer as a prop
        />
      )}
    </div>
  );
}
