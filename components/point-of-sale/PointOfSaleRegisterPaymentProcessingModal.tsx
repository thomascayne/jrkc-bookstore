import CreditCardIcons from '@/components/CreditCardIcons';
import { IOrder } from '@/interfaces/IOrder';
import {
  CardType,
  generateMockCreditCard,
} from '@/utils/creditCardUtils';
import { createStripePaymentIntent } from '@/utils/stripe-payment-helper';
import { Button, Card, Input } from '@nextui-org/react';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { StripePaymentElementOptions } from '@stripe/stripe-js';
// components/point-of-sale/PointOfSaleRegisterPaymentProcessingModal.tsx

import React, { useEffect, useState } from 'react';
import { FaClipboard } from 'react-icons/fa';

interface PointOfSaleRegisterPaymentProcessingProps {
  cardHolderName: string;
  currentOrder: IOrder | null;
  totalAmount: number;
  onPaymentSuccess: () => void;
  onPaymentFailure: (error: string) => void;
  onReturnToRegister: (returnValue: boolean) => void;
}
type PaymentStatus = 'idle' | 'success' | 'failure';

const PointOfSaleRegisterPaymentProcessingModal: React.FC<
  PointOfSaleRegisterPaymentProcessingProps
> = ({
  cardHolderName,
  currentOrder,
  totalAmount,
  onPaymentSuccess,
  onPaymentFailure,
  onReturnToRegister,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardType, setCardType] = useState<CardType>('');
  const [clientSecret, setClientSecret] = useState('');
  const [expirationMonth, setExpirationMonth] = useState('');
  const [expirationYear, setExpirationYear] = useState('');
  const [isCardGenerated, setIsCardGenerated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [nameOnCard, setNameOnCard] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [isMockSuccess, setIsMockSuccess] = useState(false);

  const elements = useElements();
  const stripe = useStripe();

  const isSuccessStatus = (status: PaymentStatus): status is 'success' =>
    status === 'success';

  useEffect(() => {
    async function initializePaymentIntent() {
      const result = await createStripePaymentIntent(totalAmount, currentOrder);
      if (result.success) {
        setClientSecret(result?.clientSecret ?? '');
      } else {
        onPaymentFailure(result.error ?? 'An unknown error occurred');
      }
    }

    initializePaymentIntent();
  }, [totalAmount, currentOrder, onPaymentFailure]);


  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    paymentMethodOrder: ['card'] as const,
    defaultValues: {
      billingDetails: {
        name: cardHolderName,
      }
    }
  };
    const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log('process...');
    console.log('client secret', clientSecret);

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-confirmation`,
      },
    });

    if (error) {
      setPaymentStatus('failure');
      setIsMockSuccess(true);
      onPaymentFailure(error.message ?? 'An unknown error occurred');
    } else {
      setPaymentStatus('success');
      onPaymentSuccess();
    }

    setIsProcessing(false);
  };

  const generateNewCard = () => {
    const mockCard = generateMockCreditCard();
    setIsCardGenerated(true);
    setCardNumber(mockCard.cardNumber);
    cardHolderName ? setNameOnCard(cardHolderName) : setNameOnCard('John Doe'); // You can randomize this if needed
    console.log('name on card', nameOnCard);
    setExpirationMonth(mockCard.expirationMonth);
    setExpirationYear(mockCard.expirationYear);
    setCardType(mockCard.cardType as CardType);
  };

  const copyCardToClipboard = () => {
    const cardInfo = `${cardNumber}\n${nameOnCard}\n${expirationMonth}/${expirationYear}`;
    navigator.clipboard.writeText(cardInfo).then(() => {
      alert('Card information copied to clipboard!');
    });
  };

  const renderPaymentStatus = () => {
    if (paymentStatus === 'success') {
      setPaymentStatus('success')
      return (
        <Card className="bg-green-100 p-4 mb-4">
          <p className="text-green-700 font-bold">Payment Successful!</p>
        </Card>
      );
    } else if (paymentStatus === 'failure') {
      setIsMockSuccess(true);
      return (
        <p className="text-red-700 font-bold my-4">
          Payment Failed. Please try again.
        </p>
      );
    }
    return null;
  };

  const onReturnToRegisterWithValue = (returnValue: boolean) => {
    console.log('return value', returnValue);
  }

  return (
    <div className="flex flex-col items-center px-6 pb-2 py-0 h-full">
      <h2 className="text-2xl flex gap-3 font-bold py-0 m-0">
        <span> Process Payment:</span>
        <span className='text-green-600'>{`$${totalAmount.toFixed(2)}`}</span>
      </h2>
      {renderPaymentStatus()}

      {
        <>
          {!isCardGenerated && (
            <div className="flex items-center justify-center text-green-600 font-bold">
            Get a mock test credit card to test your payment.
          </div>)}

          {clientSecret && isCardGenerated && (
            <Card className="w-full max-w-md p-4">
              <PaymentElement options={paymentElementOptions} />
            </Card>
          )}
        </>
      }

      <div className="mt-auto flex flex-col justify-end items-end w-full">
        <div className={`flex gap-4`}>
          <Button
            className={`flex gap-2 ${isMockSuccess ? 'opacity-50' : ''}`}
            color="primary"
            disabled={isMockSuccess}
            onClick={generateNewCard}
          >
            <span>Get Mock Credit Card</span>
            <CreditCardIcons cardType={cardType as string} />
          </Button>
          <Button
            className="bg-yellow-500"
            disabled={!isCardGenerated || isMockSuccess}
            onClick={copyCardToClipboard}
          >
            <FaClipboard className="mr-2" />
            <span>Copy Card Info</span>
          </Button>
        </div>

        <div className="flex gap-4 items-baseline">
          <Button
            className={`bg-primary-500 ${!isProcessing || !isCardGenerated ? 'opacity-50' : ''}`}
            disabled={
              isProcessing || !isCardGenerated
            }
            size="lg"
            onClick={handleSubmit}
          >
            {isProcessing ? 'Processing...' : 'Process Payment'}
          </Button>
          <Button
            className={`mt-4 ${!isProcessing ? 'opacity-50' : ''}`}
            color="primary"
            disabled={isProcessing}
            onClick={() => onReturnToRegisterWithValue(isMockSuccess)}
            size="lg"
          >
            Return to register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PointOfSaleRegisterPaymentProcessingModal;
