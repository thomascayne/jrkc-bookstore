// components/CheckoutAccordion.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@tanstack/react-store";
import { cartStore, getTotal, getCartItemCount } from "@/stores/cartStore";
import { ICustomerCartItem } from "@/interfaces/ICustomerCart";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Link,
  Radio,
  RadioGroup,
  Tooltip,
} from "@nextui-org/react";
import { ShippingAddress } from "@/interfaces/ShippingAddress";
import { BillingAddress } from "@/interfaces/BillingAddress";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaCopy,
  FaTimes,
} from "react-icons/fa";
import { generateRandomTestCardFromStripe } from "@/utils/getRandomTestCardsFromStripe";

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
    className={`mb-4 flex w-full ${disabled ? "opacity-50" : ""}`}
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

const CheckoutAccordion: React.FC<CheckoutAccordionProps> = ({ user }) => {
  const [stripMockCreditCard, setStripMockCreditCard] = useState<
    StripMockCreditCard[] | []
  >([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<StripMockCreditCard | null>(null);
  const [isPaymentMethod, setIsPaymentMethod] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("cart");
  const cartItems = useStore(cartStore, (state) => state.items);
  const [showCopyToClipboardTooltip, setShowCopyToClipboardTooltip] =
    useState(false);

  const total = getTotal();
  const itemCount = getCartItemCount();

  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(
    null
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
          .from("profiles")
          .select("*")
          .eq("id", user.id)
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

  const copyToClipboard = (card: StripMockCreditCard, e: React.MouseEvent) => {
    e.stopPropagation();
    const cardInfo = `${card.number},${card.expMonth},${card.expYear},${card.cvc}`;
    navigator.clipboard.writeText(cardInfo).then(() => {
      setShowCopyToClipboardTooltip(true);
      setTimeout(() => setShowCopyToClipboardTooltip(false), 6000);
    });
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

  const handlePaymentMethodSubmit = (method: string) => {
    setPaymentMethod(method);
    setOpenSections((prev) => ({
      ...prev,
      review: true,
    }));
  };

  const handlePlaceOrder = () => {
    // Implement order placement logic here
    console.log("Placing order...");
  };

  useEffect(() => {
    if (itemCount === 0) {
      setOpenSection("cart");
    }
  }, [itemCount]);

  /**  function to generate mock credit card details for testing from getRandomTestCardsFromStripe
   *  returns 1 mock credit card details and add it to stripMockCreditCard. use the property "internalId" to identify the cards already added
   * and return a new card
   * */
  const generateMockCreditCard = () => {
    const internalIds = stripMockCreditCard.map((card) => card.internalId);
    const randomCard = generateRandomTestCardFromStripe(internalIds);

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

    setStripMockCreditCard((prev) => [...prev, newCard]);
  };
  const handleSelectPaymentMethod = (card: StripMockCreditCard | undefined) => {
    if (card) {
      setSelectedPaymentMethod(card);
    }
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
                  : "Add Shipping Address"
              }`}
              toggleOpen={() => toggleSection("shipping")}
              completed={!!shippingAddress}
            >
              <div className="flex flex-col px-4 min-h-20 mb-4">
                <p>
                  {shippingAddress?.shipping_first_name}{" "}
                  {shippingAddress?.shipping_last_name}
                </p>
                <p>{shippingAddress?.shipping_street_address1}</p>
                <p>{shippingAddress?.shipping_street_address2}</p>
                <p>
                  {shippingAddress?.shipping_city}{" "}
                  {shippingAddress?.shipping_state}{" "}
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
              toggleOpen={() => toggleSection("billing")}
            >
              <div className="flex flex-col px-4 min-h-20">
                <p>
                  {billingAddress?.first_name} {billingAddress?.last_name}
                </p>
                <p>{billingAddress?.street_address1}</p>
                <p>{billingAddress?.street_address2}</p>
                <p>
                  {billingAddress?.city} {billingAddress?.state}{" "}
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
              title="Payment"
              isOpen={openSections.payment}
              toggleOpen={() => toggleSection("payment")}
              disabled={!billingAddress || !shippingAddress}
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
                  <RadioGroup
                    value={selectedPaymentMethod?.internalId?.toString()}
                    onValueChange={(value) =>
                      handleSelectPaymentMethod(
                        stripMockCreditCard.find(
                          (card) => card.internalId.toString() === value
                        )
                      )
                    }
                  >
                    {stripMockCreditCard.map((card, index) => (
                      <div
                        key={card.internalId}
                        className="bg-gray-100 p-4 rounded-md mb-2"
                      >
                        <div className="flex radio-button-payment-wrapper items-center">
                          <Radio 
                            value={card.internalId.toString()}
                            classNames={{
                                base: "inline-flex m-0 hover:bg-yellow-50 transition-transform-background items-center justify-between transition-all duration-300 ease-in-out",
                                label: "w-full cursor-pointer",
                              }}
                            
                            >

                            <label
                              htmlFor={`card-${card.internalId}`}
                              className="flex items-center py-0 pointer-events-none "

                            >
                              <span className="font-semibold mr-2">
                                Card {index + 1}:
                              </span>
                              <span className="mr-4">
                                Card Number: **** **** **** {card.last4}
                              </span>
                            </label>

                            
                          </Radio>
                          {selectedPaymentMethod?.internalId ===
                            card.internalId && (
                            <Tooltip
                              className="py-1 font-semibold text-white whitespace-nowrap"
                              color="primary"
                              content={`Payment method selected: ${card.brand} ${card.last4}`}
                              isOpen={showCopyToClipboardTooltip}
                              placement="top"
                            >
                              <button
                                onClick={(e) => copyToClipboard(card, e)}
                                className="text-blue-500 hover:text-blue-700 inline-block ml-2"
                                title="Copy card details"
                              >
                                <FaCopy />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                        <div className="mt-2 ml-8">
                          <p>
                            Expiration: {card.expMonth}/{card.expYear}
                          </p>
                          <p>Brand: {card.brand}</p>
                          <p>Name on Card: {card.name}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
              <Divider />
              <div className="flex px-4 my-4 justify-center">
                <input
                  className={`inline-block transition-all duration-200 ease-in-out bg-yellow-400 text-black hover:bg-yellow-500 py-2 px-10 rounded cursor-pointer ${
                    !paymentMethod && !selectedPaymentMethod?.internalId
                      ? "hover:cursor-not-allowed bg-yellow-200 hover:bg-yellow-200"
                      : ""
                  }`}
                  type="button"
                  value="Save Payment Method"
                  disabled={!paymentMethod && !selectedPaymentMethod}
                  onClick={() => handlePaymentMethodSubmit("credit_card")}
                />
              </div>
            </AccordionItem>

            <AccordionItem
              completed={false}
              disabled={!paymentMethod}
              isOpen={openSections.review}
              title="Review Order"
              toggleOpen={() => toggleSection("review")}
            >
              {/* Add order review here */}
              <div className="flex flex-col px-4">
                <p>Order summary goes here</p>
              </div>
              <Divider className="mt-4" />
              <span className="flex justify-center my-4 w-full">
                <input
                  onClick={handlePlaceOrder}
                  className="inline-block transition-all duration-200 ease-in-out bg-yellow-400 text-black hover:bg-yellow-500 py-2 px-10 rounded cursor-pointer"
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
              <div className="flex flex-col">
                <p className="font-bold text-lg flex justify-between px-3">
                  <span>Free Shipping:</span>
                  <span>${(0).toFixed(2)}</span>
                </p>
                <p className="font-bold text-lg flex justify-between mt-4 px-3">
                  <span>Order total:</span>
                  <span>${total.toFixed(2)}</span>
                </p>
              </div>
              {itemCount > 0 && (
                <div className="flex mb-4 justify-center w-full">
                  <input
                    className="mt-4 inline-block transition-all duration-200 ease-in-out bg-yellow-400 text-black hover:bg-yellow-500 py-2 px-20 rounded cursor-pointer"
                    id="place-order-accordion"
                    type="button"
                    value="Place your order"
                    color="warning"
                    onClick={() => setOpenSection("review")}
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
