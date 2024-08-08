// app/profile/PaymentMethods.tsx

"use client";

import { IPaymentMethod } from "@/interfaces/IPaymentMethod";
import { createClient } from "@/utils/supabase/client";
import {
  Button,
  Card,
  Input,
  RadioGroup,
  Radio,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { User } from "@supabase/supabase-js";
import { useEffect, useState, FormEvent } from "react";
import { FaPlus } from "react-icons/fa";
import CreditCardIcons from '@/components/CreditCardIcons';

interface PaymentMethodProps {
  user: User | null;
}

export default function ProfilePaymentMethods({ user }: PaymentMethodProps) {
  const [cardType, setCardType] = useState<string>("");
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] =
    useState<string>("");
  const [expirationMonth, setExpirationMonth] = useState<string>("");
  const [expirationYear, setExpirationYear] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [nameOnCard, setNameOnCard] = useState<string>("");
  const [newCardNumber, setNewCardNumber] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const supabase = createClient();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    key: (i + 1).toString().padStart(2, "0"),
    label: (i + 1).toString().padStart(2, "0"),
  }));

  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    key: (currentYear + i).toString(),
    label: (currentYear + i).toString(),
  }));

  useEffect(() => {
    const isNewCardNumber: boolean = newCardNumber.length > 0;
    const isNameValid = nameOnCard.length >= 3;
    const isMonthValid = expirationMonth !== "";
    const isYearValid = expirationYear !== "";
    const isDateValid =
      parseInt(expirationYear) > currentYear ||
      (parseInt(expirationYear) === currentYear &&
        parseInt(expirationMonth) >= currentMonth);

    setIsFormValid(
      isNameValid &&
        isMonthValid &&
        isYearValid &&
        isDateValid &&
        isNewCardNumber
    );
  }, [
    nameOnCard,
    expirationMonth,
    expirationYear,
    currentYear,
    currentMonth,
    newCardNumber,
  ]);

  useEffect(() => {
    async function fetchPaymentMethods() {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user?.id);

      if (data) {
        setPaymentMethods(data);
        const defaultMethod = data.find((method) => method.is_default);
        if (defaultMethod) {
          setDefaultPaymentMethodId(defaultMethod.id);
        }
      }
    }

    fetchPaymentMethods();
  }, [user, supabase]);

  const handleAddPaymentMethod = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real implementation, you would use a payment processor SDK here
    // to tokenize the card information securely
    const mockToken = "mock_token_" + Math.random().toString(36).substr(2, 9);

    const newMethod: IPaymentMethod = {
      id: mockToken,
      card_type: cardType,
      card_last4: parseInt(newCardNumber.slice(-4), 10),
      card_exp_month: parseInt(expirationMonth, 10),
      card_exp_year: parseInt(expirationYear,10),
      name_on_card: nameOnCard,
      is_default: paymentMethods.length === 0,
      payment_processor: "stripe",
      payment_token: mockToken,
      user_id: user?.id as string,
      card_brand: "",
    };

    console.log("newMethod ", newMethod);

    const { data, error } = await supabase
      .from("payment_methods")
      .insert({
        card_type: newMethod.card_type,
        expiration_month: newMethod.card_exp_month,
        expiration_year: newMethod.card_exp_month,
        is_default: newMethod.is_default,
        last_four: newMethod.card_last4,
        name_on_card: newMethod.name_on_card,
        payment_processor: "stripe",
        payment_token: mockToken,
        user_id: user?.id,
      })
      .select()
      .maybeSingle();

    console.log("data: ", data);

    if (data) {
      setPaymentMethods([...paymentMethods, newMethod]);
      if (paymentMethods.length === 0) {
        setDefaultPaymentMethodId(newMethod.id);
      }
    }

    setShowModal(false);
  };

  const handleDefaultChange = async (paymentMethodId: string) => {
    const { data, error } = await supabase
      .from("payment_methods")
      .update({ is_default: false })
      .eq("user_id", user?.id);

    if (!error) {
      const { data: updatedData, error: updateError } = await supabase
        .from("payment_methods")
        .update({ is_default: true })
        .eq("id", paymentMethodId)
        .select()
        .single();

      if (updatedData) {
        setDefaultPaymentMethodId(paymentMethodId);
        setPaymentMethods(
          paymentMethods.map((method) =>
            method.id === paymentMethodId
              ? { ...method, is_default: true }
              : { ...method, is_default: false }
          )
        );
      }
    }
  };

  const generateMockCreditCard = () => {
    const cardTypes = ["Visa", "Mastercard", "Amex", "Discover"];
    const randomType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    let cardNumber: string;

    switch (randomType) {
      case "Visa":
        cardNumber = "4" + Math.random().toString().slice(2, 17);
        break;
      case "Mastercard":
        cardNumber = "5" + Math.random().toString().slice(2, 17);
        break;
      case "Amex":
        cardNumber =
          "3" +
          (Math.random() > 0.5 ? "4" : "7") +
          Math.random().toString().slice(2, 16);
        break;
      case "Discover":
        cardNumber = "6" + Math.random().toString().slice(2, 17);
        break;
      default:
        cardNumber = Math.random().toString().slice(2, 18);
    }

    const expirationYear = currentYear + Math.floor(Math.random() * 8);
    const expirationMonth = Math.floor(Math.random() * 12) + 1;

    setCardType(randomType);
    setNewCardNumber(cardNumber);
    setExpirationMonth(expirationMonth.toString().padStart(2, "0"));
    setExpirationYear(expirationYear.toString());
  };

  const formatCardNumber = (number: string): string => {
    if (cardType === "Amex") {
      return number.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
    } else {
      return number.replace(/(\d{4})(?=\d)/g, "$1 ");
    }
  };

  return (
    <section className="flex flex-col">
      <div className="mb-4 mt-10">
        <h2 className="text-xl font-bold mb-2 mr-8 my-auto items-center">
          <span>Payment Methods</span>
          <button
            className="bg-green-500 text-white px-2 py-2 ml-4 rounded-full hover:bg-green-700 transition-all duration-200 ease-in-out"
            onClick={() => setShowModal(true)}
          >
            <FaPlus />
          </button>
        </h2>

        <RadioGroup
          value={defaultPaymentMethodId}
          onValueChange={handleDefaultChange}
        >
          <div className="flex flex-wrap gap-4">
            {paymentMethods.map((method) => (
              <Card
                key={method.id}
                className="p-2 px-4 flex-grow sm:flex-grow-0 sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.67rem)] xl:w-[calc(25%-0.75rem)]"
                radius="sm"
                shadow="md"
              >
                <div className="flex flex-col items-center py-2">
                  <div className="mr-4 w-[40px]">
                    {<CreditCardIcons cardType={method.card_type} />}
                  </div>
                  <div className="flex flex-col w-[calc(100%-40px)]">
                    <p className="border rounded-sm border-gray-300 dark:border-gray-600 p-1 mb-4 flex flex-grow">
                      {method.card_type} **** **** **** {method.card_last4}
                    </p>
                    <p className="border rounded-sm border-gray-300 dark:border-gray-600 p-1 px-4 flex flex-grow">
                      {method.name_on_card}
                    </p>
                    <Radio value={method.id}>Default</Radio>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      {showModal && (
        <div className="flex flex-col md:max-w-[400px]">
          <h3 className="text-lg font-bold mb-2 mr-2">
            <span className="mr-4">Add Payment Method</span>
            <Button variant="light" onClick={generateMockCreditCard}>
              Mock Credit Card
            </Button>
          </h3>
          <Card className="mb-2 p-6">
            <form onSubmit={handleAddPaymentMethod}>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full h-14">
                  <Input
                    name="cardNumber"
                    placeholder="Card Number"
                    radius="none"
                    readOnly
                    size="lg"
                    endContent={
                      <div className="pointer-events-none flex-shrink-0">
                        {<CreditCardIcons cardType={cardType} />}{" "}
                      </div>
                    }
                    type="text"
                    value={formatCardNumber(newCardNumber)}
                    variant="bordered"
                    style={{ height: "100%" }}
                    isRequired
                    required
                  />
                </div>
                <Input
                  className="mb-2"
                  label="Name on Card"
                  value={nameOnCard}
                  name={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  radius="none"
                  required
                  isRequired
                  minLength={3}
                />
                <div className="flex flex-grow w-full mb-4">
                  <Select
                    className="mr-2"
                    label="Month"
                    value={expirationMonth}
                    name={expirationMonth}
                    onChange={(e) => setExpirationMonth(e.target.value)}
                    radius="none"
                    required
                  >
                    {monthOptions.map((month) => (
                      <SelectItem key={month.key} value={month.key}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Year"
                    value={expirationYear}
                    name={expirationYear}
                    onChange={(e) => setExpirationYear(e.target.value)}
                    radius="none"
                    required
                  >
                    {yearOptions.map((year) => (
                      <SelectItem key={year.key} value={year.key}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="flex justify-end w-full gap-4">
                  <Button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mr-2"
                    radius="none"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    radius="none"
                    isDisabled={!isFormValid}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </section>
  );
}
