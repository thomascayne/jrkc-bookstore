// components/crm/AdminPanel.tsx

import React, { useState } from 'react';
import CustomerDetailsModal from '@/components/crm/CustomerDetailsModal';
import { fetchCustomers } from '@/utils/supabase/customerApi';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';

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

const AdminPanel: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(false);
  };

  return (
    <div className="admin-panel">
      <h2 className="text-2xl font-bold">Admin Panel</h2>
      <Table aria-label="Customer Table">
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>First Name</TableColumn>
          <TableColumn>Last Name</TableColumn>
          <TableColumn>Email</TableColumn>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} onClick={() => handleOpenModal(customer)}>
              <TableCell>{customer.id}</TableCell>
              <TableCell>{customer.first_name}</TableCell>
              <TableCell>{customer.last_name}</TableCell>
              <TableCell>{customer.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AdminPanel;
