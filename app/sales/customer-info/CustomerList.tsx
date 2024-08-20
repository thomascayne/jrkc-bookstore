// app/sales/customer-info/CustomerList.tsx

import { UserProfile } from '@/interfaces/UserProfile';

interface CustomerListProps {
  customers: UserProfile[];
}

export default function CustomerList({ customers }: CustomerListProps) {
  if (!customers || customers.length === 0) {
    return <div>No customers found.</div>;
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
            <tr key={customer.id}>
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
}
