// components/crm/CustomerDetailsModal.tsx

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any; // You can replace 'any' with a more specific type if you have a Customer interface
}

export default function CustomerDetailsModal({ isOpen, onClose, customer }: CustomerDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Customer Details</ModalHeader>
        <ModalBody>
          <p><strong>Name:</strong> {customer.name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.phone}</p>
          <p><strong>Address:</strong> {customer.address}</p>
        </ModalBody>
        <ModalFooter>
          {/* Removed 'flat' and 'auto' and used supported properties */}
          <Button color="danger" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
