// components/crm/CustomerDetailsModal.tsx

import React from 'react';

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

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null; // Ensure that customer is an object or null initially
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="customer-details-modal">
      <div className="modal-content">
        <h2>Customer Details</h2>
        <p><strong>First Name:</strong> {customer.first_name}</p>
        <p><strong>Last Name:</strong> {customer.last_name}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Shipping Address:</strong> {customer.shipping_street_address1}</p>
        <p><strong>City:</strong> {customer.shipping_city}</p>
        <p><strong>State:</strong> {customer.shipping_state}</p>
        <p><strong>Zip Code:</strong> {customer.shipping_zipcode}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
