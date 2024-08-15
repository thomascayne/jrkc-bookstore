// components/point-of-sale/PointOfSaleOverlay.tsx

import React, { useState } from 'react';
import { Modal, Button, Input, ModalBody, ModalFooter } from '@nextui-org/react';
import { FaExclamationTriangle } from 'react-icons/fa';
import PointOfSaleRegister from '@/components/point-of-sale/PointOfSaleRegister';
import { usePointOfSaleStore } from '@/hooks/usePointOfSaleStore';

interface PointOfSaleOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const PointOfSaleOverlay: React.FC<PointOfSaleOverlayProps> = ({ isOpen, onClose }) => {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const {
    currentOrder,
    orderItems,
    isInitialized,
    initializeTransaction,
    addItem,
    removeItem,
    updateQuantity,
    getTotal,
    getItemCount,
    clearTransaction,
    completeTransaction,
    updateOrderDetails
  } = usePointOfSaleStore();

  const handleExitClick = () => {
    setIsExitModalOpen(true);
  };

  const handleConfirmExit = () => {
    // Here you would typically verify the password
    // For now, we'll just close everything
    setIsExitModalOpen(false);
    onClose();
  };

  const handleCancelExit = () => {
    setIsExitModalOpen(false);
    setPassword('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50">
      <PointOfSaleRegister onExitClick={handleExitClick} />

      <Modal isOpen={isExitModalOpen} onClose={handleCancelExit}>
        <ModalBody>
          {orderItems.length > 0 ? (
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <FaExclamationTriangle className="text-yellow-500 text-4xl mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Please confirm your exit from Point of Sale by entering your password</h2>
              <p className="mb-4">The current register will be discarded</p>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          ) : (
            <h2 className="text-xl font-bold mb-4">Please confirm your exit from Point of Sale</h2>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="success" onPress={handleConfirmExit}>
            Yes - Exit
          </Button>
          <Button color="warning" onPress={handleCancelExit}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PointOfSaleOverlay;