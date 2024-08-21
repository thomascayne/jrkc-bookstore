// components/crm/CustomerDetailsModal.tsx
import React, { useEffect, useState } from 'react';
import { fetchCustomerDetails } from '@/utils/supabase/customerApi';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
  };
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ isOpen, onClose, customer }) => {
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomerDetails = async () => {
      try {
        setLoading(true);
        const details = await fetchCustomerDetails(customer.id);
        setCustomerDetails(details);
      } catch (error) {
        console.error('Failed to fetch customer details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadCustomerDetails();
    }
  }, [isOpen, customer]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!customerDetails) {
    return <p>No details available</p>;
  }

  return (
    <div className="modal">
      <h2>Customer Details</h2>
      <p>ID: {customerDetails.id}</p>
      <p>Name: {customerDetails.first_name} {customerDetails.last_name}</p>
      {/* Add more fields as necessary */}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default CustomerDetailsModal;
