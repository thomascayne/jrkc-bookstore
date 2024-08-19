// app/sales/customer-info/CustomerList.tsx

import React, { useEffect, useState } from 'react';
import { fetchCustomers } from '@/utils/supabase/customerApi';
import { UserProfile } from '@/interfaces/UserProfile';

interface CustomerListProps {
  onSelectCustomer: (customer: UserProfile) => void;
}

const CustomerList = ({ onSelectCustomer }: CustomerListProps) => {
  const [customers, setCustomers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const loadCustomers = async () => {
      const data = await fetchCustomers();
      console.log('Fetched Customers:', data); // Log the fetched customers for debugging
      setCustomers(data);
    };

    loadCustomers();
  }, []);

  if (customers.length === 0) {
    return <p>No customers found</p>;
  }

  return (
    <div>
      <h1>Customer Information</h1>
      <table>
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} onClick={() => onSelectCustomer(customer)}>
              <td>{customer.id}</td>
              <td>{customer.first_name}</td>
              <td>{customer.last_name}</td>
              <td>{customer.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;
