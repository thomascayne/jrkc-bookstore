// components/CheckoutAccordion.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@tanstack/react-store';
import { cartStore, getTotal, getCartItemCount } from '@/stores/cartStore';
import { ICustomerCartItem } from '@/interfaces/ICustomerCart';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Link,
  Radio,
  RadioGroup,
  Tooltip,
} from '@nextui-org/react';
import { ShippingAddress } from '@/interfaces/ShippingAddress';
import { BillingAddress } from '@/interfaces/BillingAddress';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import {
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaCopy,
  FaTimes,
} from 'react-icons/fa';
import { generateRandomTestCardFromStripe } from '@/utils/getRandomTestCardsFromStripe';
import { Appearance, loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useFullScreenModal } from '@/contexts/FullScreenModalContext';
import CustomerPaymentProcessingModal from '@/components/checkout/CustomerPaymentProcessingModal';
import { waitSomeTime } from '@/utils/wait-some-time';
import CreditCardIcons from '@/components/CreditCardIcons';

interface AccordionItemProps {
  children: React.ReactNode;
  completed?: boolean;
  disabled?: boolean;
  isOpen: boolean;
  title: string;
  toggleOpen: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  children,
  completed = false,
  disabled = false,
  isOpen,
  title,
  toggleOpen,
}) => (
  <Card
    className={`mb-4 flex w-full ${disabled ? 'opacity-50' : ''}`}
    shadow="md"
  >
    <CardHeader>
      <div className="w-full">
        <button
          className="flex w-full justify-between items-center p-4 text-left py-2 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-800 rounded-tl-large rounded-tr-large"
          onClick={toggleOpen}
          disabled={disabled}
        >
          <div className="flex items-center">
            <h2 className="font-bold line-clamp-2 mr-2">{title}</h2>
            {completed ? (
              <FaCheck className="text-green-500" />
            ) : (
              <FaTimes className="text-red-500" />
            )}
          </div>
          <span className="transition-transform ease-in-out duration-[800]">
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </button>
      </div>
    </CardHeader>
    <Divider {...(isOpen ? {} : { hidden: true })} />
    {isOpen && (
      <CardBody className="transition-all duration-[900] ease-in-out">
        {children}
      </CardBody>
    )}
  </Card>
);

interface StripMockCreditCard {
  brand: string;
  cvc: string;
  expMonth: number;
  expYear: number;
  internalId: number;
  last4: string;
  name: string;
  number: string;
}

interface CheckoutAccordionProps {
  user: User | null;
}

const TAX_RATE = 0.065;

const CheckoutAccordion: React.FC<CheckoutAccordionProps> = ({ user }) => {
  const [stripMockCreditCard, setStripMockCreditCard] = useState<
    StripMockCreditCard[] | []
  >([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<StripMockCreditCard | null>(null);
  const [isPaymentMethod, setIsPaymentMethod] = useState(false);
  const [isPaymentMethodSaved, setIsPaymentMethodSaved] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('cart');
  const [isLoading, setIsLoading] = useState(false);
  const [stripePromise, setStripePromise] = useState<Stripe>();
  const cartItems = useStore(cartStore, (state) => state.items);
  const { closeFullScreenModal, openFullScreenModal } = useFullScreenModal();
  const [showCopyToClipboardTooltip, setShowCopyToClipboardTooltip] =
    useState(false);
  const subtotal = useStore(cartStore, getTotal);

  const taxAmount = subtotal * TAX_RATE;
  const totalAmount = subtotal + taxAmount;
  const [mockCreditCard, setMockCreditCard] =
    useState<StripMockCreditCard | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const itemCount = getCartItemCount();

  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState({
    cart: true,
    shipping: false,
    billing: false,
    payment: false,
    review: false,
  });

  const supabase = createClient();

  useEffect(() => {
    // check if stripMockCreditCard is empty and set isPaymentMethod to false else set it to true
    stripMockCreditCard && stripMockCreditCard.length === 0
      ? setIsPaymentMethod(false)
      : setIsPaymentMethod(true);
  }, [stripMockCreditCard]);

  useEffect(() => {
    async function loadUserAddresses() {
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setBillingAddress({
            first_name: profile.first_name as string,
            last_name: profile.last_name as string,
            street_address1: profile.street_address1 as string,
            street_address2: profile.street_address2 as string,
            city: profile.city as string,
            state: profile.state as string,
            zipcode: profile.zipcode as string,
            country: profile.country as string,
            phone: profile.phone as string,
          });

          setShippingAddress({
            shipping_first_name: profile.shipping_first_name as string,
            shipping_last_name: profile.shipping_last_name as string,
            shipping_street_address1:
              profile.shipping_street_address1 as string,
            shipping_street_address2:
              profile.shipping_street_address2 as string,
            shipping_city: profile.shipping_city as string,
            shipping_state: profile.shipping_state as string,
            shipping_zipcode: profile.shipping_zipcode as string,
            shipping_country: profile.shipping_country as string,
            shipping_phone: profile.shipping_phone as string,
          });
        }
      }
    }

    loadUserAddresses();
  }, [supabase, user]);

  useEffect(() => {
    if (itemCount === 0) {
      setOpenSections((prev) => ({
        ...prev,
        cart: true,
        shipping: false,
        billing: false,
        payment: false,
        review: false,
      }));
    }
  }, [itemCount]);

  const copyToClipboard = () => {
    if (mockCreditCard) {
      const cardInfo = `${mockCreditCard.number},${mockCreditCard.expMonth},${mockCreditCard.expYear},${mockCreditCard.cvc}`;
      navigator.clipboard.writeText(cardInfo).then(() => {
        setIsCopied(true);
        setShowCopyToClipboardTooltip(true);
        setTimeout(() => setShowCopyToClipboardTooltip(false), 6000);
      });
    }
  };
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleShippingAddressSubmit = () => {
    if (shippingAddress) {
      setOpenSections((prev) => ({
        ...prev,
        shipping: false,
        billing: true,
      }));
    }
  };

  const handleBillingAddressSubmit = () => {
    if (billingAddress) {
      setOpenSections((prev) => ({
        ...prev,
        billing: false,
        payment: true,
      }));
    }
  };

  const handleClosePaymentProcessingModal = async () => {
    await waitSomeTime(300);
    closeFullScreenModal();
  };

  const handlePlaceOrder = async () => {
    const stripeInstance = await loadStripe(
      `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`,
    );

    if (!stripeInstance) {
      console.error('Stripe Promise not initialized');
      return;
    }

    try {
      setIsLoading(true);

      setStripePromise(stripeInstance);

      // Create PaymentIntent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount, 
        }),
      });

      console.log("stripe payment: ", response);
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      const appearance: Appearance = {
        theme: 'stripe',
      };

      const options = {
        clientSecret,
        appearance: appearance,
        paymentMethodOrder: ['card'],
      };

      openFullScreenModal(
        <Elements stripe={stripeInstance} options={options}>
          <CustomerPaymentProcessingModal
            onClose={() => {
              handleClosePaymentProcessingModal();
            }}
            onReturnToCart={(returnvalue) => {
              // Handle successful payment (e.g., clear cart, show confirmation)
            }}
            subtotal={subtotal}
            taxAmount={taxAmount}
            total={totalAmount}
          />
        </Elements>,
        'Enter Payment Details',
        {
          centerHeaderContents: true,
          disableEscape: true,
          height: '700px',
          showCloseButton: false,
          showEscapeHint: false,
          width: '500px',
        },
      );
    } catch (error) {
      console.error('Error loading Stripe:', error);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnFromMakingPaymentCart = () => {
    
  }

  useEffect(() => {
    if (itemCount === 0) {
      setOpenSection('cart');
    }
  }, [itemCount]);

  /**  function to generate mock credit card details for testing from getRandomTestCardsFromStripe
   *  returns 1 mock credit card details and add it to stripMockCreditCard. use the property "internalId" to identify the cards already added
   * and return a new card
   * */
  const generateMockCreditCard = () => {
    const randomCard = generateRandomTestCardFromStripe([]);

    const newCard: StripMockCreditCard = {
      brand: randomCard.brand,
      cvc: randomCard.cvc,
      expMonth: randomCard.expMonth,
      expYear: randomCard.expYear,
      internalId: parseInt(randomCard.last4),
      last4: randomCard.last4,
      name: `${billingAddress?.first_name} ${billingAddress?.last_name}`,
      number: randomCard.number,
    };

    setMockCreditCard(newCard);
    setIsCopied(false);
    setIsPaymentMethodSaved(false);
  };

  const handleSavePaymentMethod = () => {
    setIsPaymentMethodSaved(true);
    setPaymentMethod('credit_card');
    setOpenSections((prev) => ({ ...prev, payment: false }));
    toggleSection('review');
  };

  return (
    <div className="container  flex flex-col lg:flex-row gap-6">
      <div className="lg:w-4/5">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col">
            <AccordionItem
              disabled={itemCount === 0}
              isOpen={openSections.shipping}
              title={`${
                shippingAddress
                  ? `Deliver to ${shippingAddress?.shipping_first_name.toUpperCase()} ${shippingAddress?.shipping_last_name.toUpperCase()}`
                  : 'Add Shipping Address'
              }`}
              toggleOpen={() => toggleSection('shipping')}
              completed={!!shippingAddress}
            >
              <div className="flex flex-col px-4 min-h-20 mb-4">
                <p>
                  {shippingAddress?.shipping_first_name}{' '}
                  {shippingAddress?.shipping_last_name}
                </p>
                <p>{shippingAddress?.shipping_street_address1}</p>
                <p>{shippingAddress?.shipping_street_address2}</p>
                <p>
                  {shippingAddress?.shipping_city}{' '}
                  {shippingAddress?.shipping_state}{' '}
                  {shippingAddress?.shipping_country}
                </p>
                <p>{shippingAddress?.shipping_phone}</p>
              </div>
              <Divider />
              <div className="flex px-4 my-4 justify-center">
                <input
                  className="inline-block transition-all duration-200 ease-in-out bg-yellow-400 text-black hover:bg-yellow-500 py-2 px-10 rounded cursor-pointer"
                  disabled={!shippingAddress}
                  id="shipping-accordion"
                  onClick={handleShippingAddressSubmit}
                  type="button"
                  value="Deliver to this address"
                />
              </div>
            </AccordionItem>

            <AccordionItem
              completed={!!billingAddress}
              disabled={!shippingAddress}
              isOpen={openSections.billing}
              title="Billing Address"
              toggleOpen={() => toggleSection('billing')}
            >
              <div className="flex flex-col px-4 min-h-20">
                <p>
                  {billingAddress?.first_name} {billingAddress?.last_name}
                </p>
                <p>{billingAddress?.street_address1}</p>
                <p>{billingAddress?.street_address2}</p>
                <p>
                  {billingAddress?.city} {billingAddress?.state}{' '}
                  {billingAddress?.zipcode}
                </p>
                <p>{billingAddress?.phone}</p>
              </div>
              <Divider />
              <div className="flex px-4 my-4 justify-center">
                <input
                  className="inline-block transition-all duration-200 ease-in-out bg-yellow-400 text-black hover:bg-yellow-500 py-2 px-10 rounded cursor-pointer"
                  disabled={!billingAddress}
                  id="billing-accordion"
                  type="button"
                  value="Use this billing address"
                  onClick={handleBillingAddressSubmit}
                />
              </div>
            </AccordionItem>
            <AccordionItem
              title="Payment Method"
              isOpen={openSections.payment}
              toggleOpen={() => toggleSection('payment')}
              disabled={!billingAddress || !shippingAddress}
              completed={isPaymentMethodSaved}
            >
              <div className="flex flex-col px-4 min-h-20">
                <div>
                  <h5 className="mb-2 mr-2">
                    <span className="mr-4">+ Add Payment Method</span>
                    <Link
                      href="#"
                      onClick={generateMockCreditCard}
                      className="hover:underline text-green-500 hover:text-green-900 font-normal text-sm"
                    >
                      Mock Credit Card
                    </Link>
                  </h5>
                </div>

                <div className="flex flex-col mt-4">
                  {mockCreditCard && (
                    <div className="bg-gray-100 p-4 rounded-md mb-4">
                      <div className="flex items-start justify-start">
                        <div className="flex">
                          <CreditCardIcons cardType={mockCreditCard.brand} />
                        </div>
                        <div className="ml-4 flex flex-col">
                          <p>Card Number: {mockCreditCard.number}</p>
                          <p>
                            Expiry: {mockCreditCard.expMonth}/
                            {mockCreditCard.expYear}
                          </p>
                          <p>CVC: {mockCreditCard.cvc}</p>
                          <p>Name: {mockCreditCard.name}</p>
                        </div>
                        <div className="flex relative">
                          <Tooltip
                            className="p-4 font-semibold bg-green-600 text-white whitespace-nowrap"
                            content={`Payment method copied to clipboard: ${mockCreditCard.brand} ${mockCreditCard.last4}`}
                            isOpen={showCopyToClipboardTooltip}
                          >
                            <Button
                              color="primary"
                              onClick={copyToClipboard}
                              className="px-2 flex"
                              radius="md"
                            >
                              <FaCopy /> <span> Copy Card Info</span>
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Divider />
              <div className="flex px-4 my-4 justify-center">
                <input
                  className={`inline-block transition-all duration-200 ease-in-out bg-yellow-400 text-black hover:bg-yellow-500 py-2 px-10 rounded cursor-pointer ${
                    !isCopied ? 'opacity-50' : ''
                  }`}
                  type="button"
                  value="Save Payment Method"
                  disabled={!isCopied}
                  onClick={handleSavePaymentMethod}
                />
              </div>
            </AccordionItem>

            <AccordionItem
              completed={cartItems.length > 0}
              disabled={!paymentMethod}
              isOpen={openSections.review}
              title="Review Your Order"
              toggleOpen={() => toggleSection('review')}
            >
              <div className="flex flex-col px-4">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center mb-2"
                  >
                    <div>
                      <p className="font-medium">{item.book.title}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.book.list_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-end w-full">
                  <p className="font-medium">Total: ${totalAmount.toFixed(2)}</p>
                </div>
              </div>
              <Divider className="mt-4" />
              <span className="flex justify-center my-4 w-full">
                <input
                  onClick={handlePlaceOrder}
                  className={`inline-block transition-all duration-200 ease-in-out bg-yellow-400 text-black hover:bg-yellow-500 py-2 px-10 rounded cursor-pointer ${
                    !isCopied ? 'opacity-50' : ''
                  }`}
                  disabled={!isCopied || cartItems.length === 0}
                  id="place-order-accordion"
                  type="button"
                  value="Place order"
                />
              </span>
            </AccordionItem>
          </div>
        </div>
      </div>

      <div className="lg:w-2/5">
        <Card className={`flex w-full`} shadow="md">
          <CardHeader>
            <div className="w-full flex justify-between items-center p-3 text-left py-2">
              <h2 className="font-bold text-lg mb-1 line-clamp-2">
                Cart Summary
              </h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="flex flex-col w-full">
              {cartItems.map((item: ICustomerCartItem) => (
                <div
                  key={item.book_id}
                  className="mb-2 px-3 flex justify-between"
                >
                  <p>
                    {item.book.title} ({item.quantity})
                  </p>
                  <p>${item.book.list_price}</p>
                </div>
              ))}
              <Divider className="my-4" />
              <div className="flex flex-col mb-4">
                <p className="flex justify-between px-3 font-semibold mb-3">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </p>
                <p className="flex justify-between px-3">
                  <span>Taxes ({TAX_RATE * 100}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </p>
                <p className="flex justify-between px-3 mb-2">
                  <span>Free Shipping:</span>
                  <span>${(0).toFixed(2)}</span>
                </p>
                <p className="font-bold text-lg flex justify-between px-3">
                  <span>Order total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </p>
              </div>
              <Divider />
              {itemCount > 0 && (
                <div className="flex mb-4 justify-center w-full mt-4">
                  <input
                    className={`inline-block transition-all duration-200 ease-in-out bg-yellow-400 text-black hover:bg-yellow-500 py-2 px-10 rounded cursor-pointer ${
                      !isCopied ? 'opacity-50' : ''
                    }`}
                    id="place-order-accordion"
                    type="button"
                    value="Place your order"
                    disabled={!isCopied || cartItems.length === 0}
                    color="warning"
                    onClick={() => setOpenSection('review')}
                  />
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutAccordion;
