// app/sales/customer-info/CustomerDetails.tsx
import React from 'react';
import PurchaseHistory from './PurchaseHistory';
import Recommendations from './Recommendations';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

export default function CustomerDetails({ customer }: { customer: UserProfile }) {
  return (
    <div>
      <h2>{customer.first_name} {customer.last_name}</h2>
      <p>Email: {customer.email}</p>
      {/* Render other customer details */}
      
      <PurchaseHistory customerId={customer.id} />
      <Recommendations customerId={customer.id} />
    </div>
  );
}
