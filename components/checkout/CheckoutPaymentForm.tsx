// components\checkout\PaymentForm.tsx

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  RadioGroup,
  Radio,
  Select,
  SelectItem,
} from "@nextui-org/react";
import CreditCardIcons from "@/components/CreditCardIcons";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { FaPlus } from "react-icons/fa";
import {
  CardType,
  detectCardType,
  formatCardNumber,
  generateMockCreditCard,
} from "@/utils/creditCardUtils";
import { IPaymentMethod } from "@/interfaces/IPaymentMethod";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { IStripePaymentMethod } from "@/interfaces/IStripePaymentMethod";

const stripePromise = loadStripe(
  "pk_test_51PkhSnRxhlSxkavi1mWf7Wal8NUjh6ztO4mRC8BOlZAKUh9SoGaqtIVneJxqVL2jabRwkef7bPxiVvPUElFBcaiX00zzyx1ZYx"
);

interface PaymentFormProps {
  user: User | null;
  onPaymentMethodSelect: (paymentMethod: IPaymentMethod) => void;
}

export default function CheckoutPaymentForm({
  user,
  onPaymentMethodSelect,
}: PaymentFormProps) {
  const [cardType, setCardType] = useState<string>("");
  const [expirationMonth, setExpirationMonth] = useState<string>("");
  const [expirationYear, setExpirationYear] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [nameOnCard, setNameOnCard] = useState<string>("");
  const [newCardNumber, setNewCardNumber] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
    useState<string>("");
  const [useStripeElement, setUseStripeElement] = useState<boolean>(false);

  const stripe = useStripe();
  const elements = useElements();
  const supabase = createClient();

  useEffect(() => {
    setIsFormValid(nameOnCard.length >= 3);
  }, [nameOnCard]);

  useEffect(() => {
    async function fetchPaymentMethods() {
      if (!user) return;

      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id);

      if (data) {
        setPaymentMethods(data);

        if (data.length > 0) {
          const defaultMethod =
            data.find((method) => method.is_default) || data[0];
          setSelectedPaymentMethodId(defaultMethod.id);
          onPaymentMethodSelect(defaultMethod.id);
        }
      }
    }

    fetchPaymentMethods();
  }, [user, supabase, onPaymentMethodSelect]);

  const convertToStripePaymentMethod = (
    paymentInfo: Partial<IPaymentMethod>
  ): any => {
    return {
      type: "card",
      card: elements?.getElement(CardElement),
      billing_details: {
        name: paymentInfo.name_on_card,
      },
    };
  };

  const handleAddPaymentMethod = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!user) return;

    let newMethod: IPaymentMethod;

    if (useStripeElement) {
      if (!stripe || !elements) return;
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: nameOnCard,
        },
      });

      if (error) {
        console.log("[error]", error);
        return;
      }
    }

    setShowAddForm(false);
    resetForm();
  };

  const handlePaymentMethodSelect = (paymentMethod: string) => {
    const selectedMethod = paymentMethods.find(
      (method) => method.id === selectedPaymentMethodId
    ) as IPaymentMethod;
    setSelectedPaymentMethodId(paymentMethod);
    onPaymentMethodSelect(selectedMethod);
  };

  const resetForm = () => {
    setNewCardNumber("");
    setNameOnCard("");
    setCardType("Unknown");
    setExpirationMonth("");
    setExpirationYear("");
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "");
    setNewCardNumber(value);
    const detectedType = detectCardType(value);
    setCardType(detectedType || "");
  };

  const handleGenerateMockCard = () => {
    const mockCard = generateMockCreditCard();
    setNewCardNumber(mockCard.cardNumber);
    setCardType(mockCard.cardType);
    setExpirationMonth(mockCard.expirationMonth);
    setExpirationYear(mockCard.expirationYear);
  };

  return (
    <section className="flex flex-col">
      <h2 className="text-xl font-bold mb-4">Payment Method</h2>
      {paymentMethods.length > 0 && (
        <RadioGroup
          value={selectedPaymentMethodId}
          onValueChange={handlePaymentMethodSelect}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paymentMethods.map((method) => (
              <Card key={method.id} className="p-4" radius="sm" shadow="md">
                <Radio value={method.id}>
                  <div className="flex items-center">
                    <div className="mr-4 w-[40px]">
                      <CreditCardIcons cardType={method.card_type} />
                    </div>
                    <div>
                      <p>
                        {method.card_type} **** {method.card_last4}
                      </p>
                      <p>{method.name_on_card}</p>
                      <p>
                        Expires: {method.card_exp_month}/{method.card_exp_year}
                      </p>
                    </div>
                  </div>
                </Radio>
              </Card>
            ))}
          </div>
        </RadioGroup>
      )}

      <Button className="mt-4 self-start" onClick={() => setShowAddForm(true)}>
        <FaPlus className="mr-2" /> Add New Payment Method
      </Button>

      {showAddForm && (
        <Card className="mt-4 p-6">
          <form onSubmit={handleAddPaymentMethod}>
            <h3 className="text-lg font-bold mb-4">Add Payment Method</h3>
            <div className="flex flex-col gap-4">
              <Input
                label="Card Number"
                value={formatCardNumber(newCardNumber, cardType as CardType)}
                onChange={handleCardNumberChange}
                endContent={<CreditCardIcons cardType={cardType} />}
              />
              <Input
                label="Name on Card"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
              />
              <div className="flex gap-4">
                <Select
                  label="Month"
                  value={expirationMonth}
                  onChange={(e) => setExpirationMonth(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem
                      key={i + 1}
                      value={(i + 1).toString().padStart(2, "0")}
                    >
                      {(i + 1).toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Year"
                  value={expirationYear}
                  onChange={(e) => setExpirationYear(e.target.value)}
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem
                      key={new Date().getFullYear() + i}
                      value={(new Date().getFullYear() + i).toString()}
                    >
                      {new Date().getFullYear() + i}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="submit" color="primary">
                  Save
                </Button>
              </div>
            </div>
          </form>
          <Button
            variant="light"
            onClick={handleGenerateMockCard}
            className="mt-4"
          >
            Generate Mock Credit Card
          </Button>
        </Card>
      )}
    </section>
  );
}
