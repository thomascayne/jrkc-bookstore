// components/point-of-sale/PointOfSaleRegisterPaymentProcessingModal.tsx

import CreditCardIcons from '@/components/CreditCardIcons';
import { IOrder } from '@/interfaces/IOrder';
import { IStripTestCardNumber } from '@/interfaces/IStripTestCardNumber';
import { CardType } from '@/utils/creditCardUtils';
import { generateRandomTestCardFromStripe } from '@/utils/getRandomTestCardsFromStripe';
import { createStripePaymentIntent } from '@/utils/stripe-payment-helper';
import { Button, Card, Input, Tooltip } from '@nextui-org/react';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { StripePaymentElementOptions } from '@stripe/stripe-js';
import React, { useEffect, useState } from 'react';
import { FaClipboard } from 'react-icons/fa';

import Loading from '@/components/Loading';

interface StripeCreditCardData {
  cardHolderName: string;
  card: IStripTestCardNumber;
}

interface PointOfSaleRegisterPaymentProcessingProps {
  cardHolderName: string;
  currentOrder: IOrder | null;
  totalAmount: number;
  onReturnToRegister: (value: string, paymentMethod: CardType) => void;
}

const PointOfSaleRegisterPaymentProcessingModal: React.FC<
  PointOfSaleRegisterPaymentProcessingProps
> = ({ cardHolderName, currentOrder, totalAmount, onReturnToRegister }) => {
  const [cardType, setCardType] = useState<CardType>(null);
  const [clientSecret, setClientSecret] = useState<string>();
  const [internalIds, setInternalIds] = useState<number[]>([]);
  const [nameOnCard, setNameOnCard] = useState<string>();
  const [paymentCardData, setPaymentCardData] =
    useState<StripeCreditCardData>();
  const [paymentState, setPaymentState] = useState({
    isProcessing: false,
    isSuccess: false,
    isFailure: false,
    isCardGenerated: false,
  });
  const [showCopyToClipboardTooltip, setShowCopyToClipboardTooltip] =
    useState<boolean>(false);

  const elements = useElements();
  const stripe = useStripe();

  useEffect(() => {
    async function initializePaymentIntent() {
      const result = await createStripePaymentIntent(totalAmount, currentOrder);
      if (result.success) {
        setClientSecret(result?.clientSecret ?? '');
      } else {
        onReturnToRegister('An unknown error occurred', '');
      }
    }

    initializePaymentIntent();
  }, [totalAmount, currentOrder, onReturnToRegister]);

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
    paymentMethodOrder: ['card'] as const,
    defaultValues: {
      billingDetails: {
        name: cardHolderName,
      },
    },
    wallets: {
      applePay: 'never',
      googlePay: 'never',
    },
  };

  const copyCardToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();

    const card = `${paymentCardData?.card.number}\n${nameOnCard}\n${paymentCardData?.card.expMonth}/${paymentCardData?.card.expYear}`;
    navigator.clipboard.writeText(card).then(() => {
      setShowCopyToClipboardTooltip(true);
      setTimeout(() => setShowCopyToClipboardTooltip(false), 9000);
    });
  };

  const handleSubmit = async (event: React.MouseEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setPaymentState((prev) => ({ ...prev, isProcessing: true }));

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: nameOnCard || cardHolderName,
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
      } else {
        setPaymentState((prev) => ({
          ...prev,
          isProcessing: false,
          isSuccess: true,
        }));
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

  const generateNewCard = () => {
    // pass in internalIds to prevent the same card from being generated twice
    const newMockCard = generateRandomTestCardFromStripe(internalIds);

    const ids = Array.from(new Set([...internalIds, newMockCard.internalId]));

    // filter out duplicate ids and update internalIds state
    setInternalIds(ids);
    cardHolderName ? setNameOnCard(cardHolderName) : setNameOnCard('John Doe');

    setPaymentCardData({
      cardHolderName,
      card: {
        brand: newMockCard.brand,
        cvc: newMockCard.cvc,
        expMonth: newMockCard.expMonth,
        expYear: newMockCard.expYear,
        last4: newMockCard.last4,
        number: newMockCard.number,
        token: newMockCard.token,
        internalId: newMockCard.internalId,
        country: 'US',
        funding: 'credit',
      },
    });

    setPaymentState((prev) => ({ ...prev, isCardGenerated: true }));
    setCardType(newMockCard.brand as CardType);
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

  const onReturnToRegisterWithValue = (returnValue: string) => {
    onReturnToRegister(returnValue, cardType);
  };

  return (
    <div className="payment-container flex flex-col items-center px-6 pb-2 py-0 h-full">
      <h2 className="text-2xl flex gap-3 font-bold py-0 my-0 mb-6">
        <span> Process Payment:</span>
        <span className="text-green-600">{`$${totalAmount.toFixed(2)}`}</span>
      </h2>

      {renderPaymentStatus()}

      {
        <div className={'w-full flex flex-col flex-grow'}>
          {!paymentState.isCardGenerated && (
            <div className="flex items-center justify-center text-green-600 font-bold">
              Get a mock test credit card to test your payment.
            </div>
          )}

          {clientSecret && paymentState.isCardGenerated && (
            <Card className="w-full max-w-md p-4 mt-6">
              <PaymentElement options={paymentElementOptions} />
            </Card>
          )}
        </div>
      }

      {paymentState.isProcessing && (
        <Loading position="absolute" containerClass="inset-0" />
      )}

      <div className="mt-auto flex flex-col justify-end items-end w-full">
        <div className={`flex gap-4`}>
          <Button
            className={`flex gap-2 ${paymentState.isSuccess || paymentState.isProcessing ? 'opacity-50' : ''}`}
            color="primary"
            disabled={paymentState.isSuccess || paymentState.isProcessing}
            onClick={generateNewCard}
            size="md"
          >
            <span>Get Mock Credit Card</span>
            <CreditCardIcons cardType={cardType as string} />
          </Button>
          <div className="relative">
            <Tooltip
              className="p-6 text-white font-bold"
              color="success"
              content={`Card information copied to clipboard: ${paymentCardData?.cardHolderName} ${paymentCardData?.card.number.substring(12)}`}
              isOpen={showCopyToClipboardTooltip}
              placement="top"
            >
              <Button
                size="md"
                key={`copy-to-clipboard-0${paymentCardData?.card.internalId}`}
                className={`bg-yellow-500 text-black font-semibold ${!paymentState.isCardGenerated ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!paymentState.isCardGenerated}
                onClick={(e) => copyCardToClipboard(e)}
              >
                <FaClipboard className="mr-2" />
                <span>Copy Card Info</span>
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="flex gap-4 mt-4 items-baseline">
          <Button
            className={`bg-primary-500 text-white ${paymentState.isProcessing || !paymentState.isCardGenerated || paymentState.isSuccess ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={
              paymentState.isProcessing ||
              !paymentState.isCardGenerated ||
              paymentState.isSuccess
            }
            size="md"
            onClick={handleSubmit}
          >
            {paymentState.isProcessing ? 'Processing...' : 'Process Payment'}
          </Button>
          <Button
            className={`${paymentState.isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            color="primary"
            disabled={paymentState.isProcessing}
            onClick={() =>
              onReturnToRegisterWithValue(
                paymentState.isSuccess ? 'success' : 'return',
              )
            }
            size="md"
          >
            Return to register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PointOfSaleRegisterPaymentProcessingModal;
