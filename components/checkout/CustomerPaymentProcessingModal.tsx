// components/CustomerPaymentProcessingModal.tsx

import { useUserProfile } from '@/hooks/useUserProfile';
import { finalizePaidCartItems } from '@/stores/cartStore';
import { Button } from '@nextui-org/react';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { StripePaymentElementOptions } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface CustomerPaymentProcessingModalProps {
  onClose: () => void;
  onReturnToCart: (returnValue: string) => void;
  total: number;
  subtotal: number;
  taxAmount: number;
}

const CustomerPaymentProcessingModal: React.FC<
  CustomerPaymentProcessingModalProps
> = ({ onClose, onReturnToCart, subtotal, taxAmount, total }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { profile } = useUserProfile();
  const router = useRouter();
  const [paymentState, setPaymentState] = useState({
    isProcessing: false,
    isSuccess: false,
    isFailure: false,
    isCardGenerated: false,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setPaymentState((prev) => ({ ...prev, isProcessing: true }));

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: `${profile?.first_name} ${profile?.last_name}`.trim(),
            },
          },
        },
        redirect: 'if_required',
      });

      if (error && error.message) {
        setPaymentState((prev) => ({
          ...prev,
          isProcessing: false,
          isFailure: true,
        }));
        console.error('Payment failed:', error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful, now finalize the cart items
        try {

          console.log('Payment successful:', paymentIntent);
          
          const order = await finalizePaidCartItems({
            paymentMethod: paymentIntent.payment_method_types[0],
            totalPaid: paymentIntent.amount,
            user_id: profile?.id as string,
          });

          console.log('Order created:', order);
          setPaymentState((prev) => ({
            ...prev,
            isProcessing: false,
            isSuccess: true,
          }));
          // Redirect to order history after a short delay
          setTimeout(() => {
            router.push('/order-history');
          }, 2000);
        } catch (finalizeError) {
          console.error('Error finalizing cart items:', finalizeError);
          setPaymentState((prev) => ({
            ...prev,
            isProcessing: false,
            isFailure: true,
          }));
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      setPaymentState((prev) => ({
        ...prev,
        isProcessing: false,
        isFailure: true,
      }));
    }
  };

  const onReturnToCartWithValue = (returnValue: string) => {
    // success or close
    if (returnValue === 'close') {
      onClose();
    } else {
      onReturnToCart(returnValue);
    }
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
    paymentMethodOrder: ['card'] as const,
    defaultValues: {
      billingDetails: {
        name: `${profile?.first_name} ${profile?.last_name}`.trim(),
      },
    },
    wallets: {
      applePay: 'never',
      googlePay: 'never',
    },
  };

  const renderPaymentStatus = () => {
    if (paymentState.isSuccess) {
      return (
        <p className="text-green-700 font-bold my-4 text-center">
          Payment Successful!
        </p>
      );
    } else if (paymentState.isFailure) {
      return (
        <p className="text-red-700 font-bold my-4 text-center">
          {"Payment Failed. Calm down. It's just a test."}
        </p>
      );
    }
    return null;
  };

  return (
    <div className="payment-container flex flex-col items-center px-6 pb-2 py-0 h-full">
      <h2 className="text-2xl flex gap-3 font-bold py-0 my-0 mb-6">
        <span> Process Payment:</span>
        <span className="text-green-600">{`$${total.toFixed(2)}`}</span>
      </h2>

      <div className="flex flex-col gap-2 w-full">
        <p className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </p>
        <p className="flex justify-between">
          <span>Tax (13%):</span> <span>${taxAmount.toFixed(2)}</span>
        </p>
        <p className="flex justify-between font-bold">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </p>
      </div>

      {renderPaymentStatus()}

      <form
        className="m-4 flex flex-col  justify-center"
        onSubmit={handleSubmit}
      >
        <div className="relative">
          <div
            className={`absolute inset-0 bg-white transition-opacity duration-300 ease-in-out pointer-events-none
      ${paymentState.isSuccess ? 'opacity-50 pointer-events-auto' : 'opacity-0'}`}
          ></div>
          <PaymentElement options={paymentElementOptions} />
        </div>

        <div className="my-4 flex justify-between">
          {paymentState.isSuccess ? (
            <Button
              radius="md"
              onClick={() => router.push('/order-history')}
              color="primary"
            >
              View Order History
            </Button>
          ) : (
            <>
              <Button
                radius="md"
                onClick={() => onReturnToCartWithValue('close')}
                color="secondary"
                disabled={paymentState.isProcessing}
              >
                Return to Cart
              </Button>
              <Button
                radius="md"
                type="submit"
                color="primary"
                disabled={!stripe || paymentState.isProcessing}
                className={`transition-opacity duration-300 ease-in-out
                  ${paymentState.isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {paymentState.isProcessing ? 'Processing...' : 'Make Payment'}
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default CustomerPaymentProcessingModal;
