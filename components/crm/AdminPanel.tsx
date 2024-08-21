// Directory: /components/crm/AdminPanel.tsx

'use client';

import React, { useState } from 'react';
import CustomerDetailsModal from '@/components/crm/CustomerDetailsModal';

interface AdminPanelProps {
  customers: Array<{ id: string; name: string; email: string }>;
}

export default function AdminPanel({ customers }: AdminPanelProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenModal = (customerId: string) => {
    setSelectedCustomer(customerId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      {customers.map((customer) => (
        <div key={customer.id} onClick={() => handleOpenModal(customer.id)}>
          <p>{customer.name}</p>
          <p>{customer.email}</p>
        </div>
      ))}

      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
