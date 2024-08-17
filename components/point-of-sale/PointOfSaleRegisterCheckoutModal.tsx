// components/point-of-sale/PointOfSaleRegisterCheckoutModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Divider } from '@nextui-org/react';
import { v4 as uuidv4 } from 'uuid';
import { IBookInventory } from '@/interfaces/IBookInventory';
import { IOrderItem } from '@/interfaces/IOrderItem';
import { IOrder } from '@/interfaces/IOrder';

interface PointOfSaleRegisterCheckoutModalProps {
  currentOrder: IOrder | null;
  orderItems: IOrderItem[];
  books: IBookInventory[];
  getTotal: () => number;
  onProceedToPayment: (totalToPay: number) => void;
  onReturnToRegister: () => void;
  isLoading?: boolean;
}

const PointOfSaleRegisterCheckoutModal: React.FC<
  PointOfSaleRegisterCheckoutModalProps
> = ({
  currentOrder,
  orderItems,
  books,
  getTotal,
  onReturnToRegister,
  onProceedToPayment,
  isLoading = false,
}) => {
  const [discount, setDiscount] = useState(0);
  const [listPriceTotal, setListPriceTotal] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [totalToPay, setTotalToPay] = useState(0);

  useEffect(() => {
    const calculatedListPriceTotal = orderItems.reduce((total, item) => {
      const book = books.find((b) => b.id === item.book_id);
      return total + (book?.retail_price ?? 0) * item.quantity;
    }, 0);

    const calculatedSubTotal = getTotal();
    const calculatedDiscount = calculatedListPriceTotal - calculatedSubTotal;
    const calculatedTaxes = calculatedSubTotal * 0.15;
    const calculatedTotalToPay = calculatedSubTotal + calculatedTaxes;

    setListPriceTotal(calculatedListPriceTotal);
    setDiscount(calculatedDiscount);
    setSubTotal(calculatedSubTotal);
    setTaxes(calculatedTaxes);
    setTotalToPay(calculatedTotalToPay);
  }, [currentOrder, getTotal, orderItems, books]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-center">
          Customer Order Summary
        </h3>
      </div>
      <div className="flex flex-col flex-grow overflow-hidden">
        <div className="flex justify-between mb-2">
          <p className="ml-2">
            <span>Transaction #:</span>
            <span className="ml-2">
              {(currentOrder?.id || uuidv4())
                ?.substring(24)
                .toLocaleUpperCase()}
            </span>
          </p>
          <p className="mr-3">{new Date().toLocaleString()}</p>
        </div>
        <Divider className="my-2" />
        <div className="flex flex-col flex-grow overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="text-left">
                <th className="w-1/12 px-2">#</th>
                <th className="w-6/12 px-2">Item</th>
                <th className="w-2/12 px-2 text-right">Qty</th>
                <th className="w-3/12 px-2 text-right">Subtotal</th>
              </tr>
            </thead>
          </table>
          <div
            className="flex-grow overflow-y-auto relative"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <table className="w-full table-fixed">
              <tbody>
                {orderItems.map((item, index) => {
                  const book = books.find((b) => b.id === item.book_id);
                  return (
                    <tr key={item.id}>
                      <td className="w-1/12 px-2 align-top">{index + 1}</td>
                      <td className="w-6/12 px-2">
                        <div className="flex flex-col">
                          <span className="line-clamp-2">{book?.title}</span>
                          <span className="text-sm text-gray-600">
                            ${(item.price_per_unit ?? 0).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="w-2/12 px-2 text-right">
                        {item.quantity}
                      </td>
                      <td className="w-3/12 px-2 text-right">
                        ${(item.price ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Divider className="my-2" />
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <p>LIST PRICE TOTAL</p>
            <p>{formatCurrency(listPriceTotal)}</p>
          </div>
          <div className="flex justify-between text-green-600 text-sm">
            <p>DISCOUNT</p>
            <p>-{formatCurrency(discount)}</p>
          </div>
          <div className="flex justify-between font-semibold text-sm">
            <p>SUB TOTAL</p>
            <p>{formatCurrency(subTotal)}</p>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <p>TAXES (15%)</p>
            <p>{formatCurrency(taxes)}</p>
          </div>
          <div className="flex justify-between font-bold mt-2">
            <p>PAY THIS AMOUNT</p>
            <p>{formatCurrency(totalToPay)}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <Button
          className={`uppercase font-semibold drop-shadow-xl ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          color="warning"
          onClick={() => onProceedToPayment(totalToPay)}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Confirm > Proceed to payment'}
        </Button>
        <Button
          className={`ml-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          color="primary"
          disabled={isLoading}
          onClick={onReturnToRegister}
        >
          Return to register
        </Button>
      </div>
    </div>
  );
};

export default PointOfSaleRegisterCheckoutModal;
