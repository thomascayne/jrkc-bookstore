// components/crm/CustomerDetailsModal.tsx

import React from 'react';
import { Button } from '@nextui-org/react';

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

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  if (!isOpen || !customer) return null;

  return (
    // Full-screen overlay to center the modal
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-lg">
        {/* Close Button */}
        <Button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-200"
        >
          ✕
        </Button>

        <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
        <p>
          <strong>First Name:</strong> {customer.first_name}
        </p>
        <p>
          <strong>Last Name:</strong> {customer.last_name}
        </p>
        <p>
          <strong>Phone:</strong> {customer.phone}
        </p>
        <p>
          <strong>Email:</strong> {customer.email}
        </p>
        <p>
          <strong>Shipping Address:</strong> {customer.shipping_street_address1}
        </p>
        <p>
          <strong>City:</strong> {customer.shipping_city}
        </p>
        <p>
          <strong>State:</strong> {customer.shipping_state}
        </p>
        <p>
          <strong>Zip Code:</strong> {customer.shipping_zipcode}
        </p>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
