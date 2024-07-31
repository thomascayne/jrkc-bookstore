// app/profile/PaymentMethods.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Link,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { User } from "@supabase/supabase-js";
import { useEffect, useState, FormEvent } from "react";
import { FaPlus } from "react-icons/fa";
import { PaymentIcon } from "react-svg-credit-card-payment-icons";

interface PaymentMethodProps {
  user: User | null;
}

interface PaymentMethod {
  cardType: string;
  cardNumber: string;
  expirationDate: string;
  nameOnCard: string;
  isDefault: boolean;
}

export default function PaymentMethods({ user }: PaymentMethodProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [cardType, setCardType] = useState<string>("");
  const [expirationMonth, setExpirationMonth] = useState<string>("");
  const [expirationYear, setExpirationYear] = useState<string>("");
  const [isDefault, setIsDefault] = useState<boolean>(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchUserProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
      }
    }

    fetchUserProfile();
  }, [user, supabase]);

  const handleAddPaymentMethod = (method: PaymentMethod) => {
    if (method.isDefault) {
      setPaymentMethods((prevMethods) =>
        prevMethods.map((m) => ({ ...m, isDefault: false }))
      );
    }
    setPaymentMethods((prevMethods) => [...prevMethods, method]);
  };

  const handleDefaultChange = (index: number) => {
    setPaymentMethods((prevMethods) =>
      prevMethods.map((method, i) => ({
        ...method,
        isDefault: i === index,
      }))
    );
  };

  const generateMockCreditCard = (): {
    cardType: string;
    cardNumber: string;
    expirationDate: string;
  } => {
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

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    let expirationYear = currentYear + Math.floor(Math.random() * 8);
    let expirationMonth = Math.floor(Math.random() * 12) + 1;

    if (expirationYear === currentYear && expirationMonth < currentMonth) {
      expirationMonth = currentMonth;
    }

    setCardType(randomType);
    setExpirationMonth(expirationMonth.toString().padStart(2, "0"));
    setExpirationYear(expirationYear.toString());

    return {
      cardType: randomType,
      cardNumber: cardNumber,
      expirationDate: `${expirationMonth
        .toString()
        .padStart(2, "0")}/${expirationYear.toString().slice(-2)}`,
    };
  };

  const formatCardNumber = (number: string): string => {
    if (cardType === "Amex") {
      return number.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
    } else {
      return number.replace(/(\d{4})(?=\d)/g, "$1 ");
    }
  };

  const getNewMockCardNumber = (): string => {
    const mockCard = generateMockCreditCard();
    setNewPaymentMethod(mockCard.cardNumber);
    return mockCard.cardNumber;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const mockCard = generateMockCreditCard();
    const newMethod: PaymentMethod = {
      ...mockCard,
      nameOnCard: (form.elements.namedItem("nameOnCard") as HTMLInputElement)
        .value,
      isDefault: isDefault,
    };
    handleAddPaymentMethod(newMethod);
    setShowModal(false);
  };

  const getCardIcon = (cardType: string) => {
    switch (cardType) {
      case "Visa":
        return <PaymentIcon type="Visa" style={{ width: 40, height: 40 }} />;
      case "Mastercard":
        return (
          <PaymentIcon type="Mastercard" style={{ width: 40, height: 40 }} />
        );
      case "Amex":
        return <PaymentIcon type="Amex" style={{ width: 40, height: 40 }} />;
      case "Discover":
        return (
          <PaymentIcon type="Discover" style={{ width: 40, height: 40 }} />
        );
      default:
        return null;
    }
  };

  const detectCardType = (cardNumber: string) => {
    if (cardNumber.startsWith("4")) return "Visa";
    if (cardNumber.startsWith("5")) return "Mastercard";
    if (cardNumber.startsWith("34") || cardNumber.startsWith("37"))
      return "Amex";
    if (cardNumber.startsWith("6")) return "Discover";
    return "";
  };

  useEffect(() => {
    if (newPaymentMethod) {
      setCardType(detectCardType(newPaymentMethod));
    }
  }, [newPaymentMethod]);

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

        <div className="flex flex-wrap gap-4">
          {paymentMethods.map((method, index) => (
            <Card
              key={index}
              className="p-2 px-4 flex-grow sm:flex-grow-0 sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.67rem)] xl:w-[calc(25%-0.75rem)]"
              radius="sm"
              shadow="md"
            >
              <div className="flex items-center py-2">
                <div className="mr-4 w-[40px]">
                  {getCardIcon(method.cardType)}
                </div>
                <div className="flex flex-col w-[calc(100%-40px)]">
                  <p className="border rounded-sm border-gray-300 dark:border-gray-600 p-1 mb-4 flex flex-grow">
                    {method.cardType} **** **** ****{" "}
                    {method.cardNumber.slice(-4)}
                  </p>
                  <p className="border rounded-sm border-gray-300 dark:border-gray-600 p-1 px-4 flex flex-grow">
                    {method.nameOnCard}
                  </p>
                  <Checkbox
                    className="mt-3"
                    isSelected={method.isDefault}
                    onValueChange={() => handleDefaultChange(index)}
                  >
                    Default
                  </Checkbox>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="flex flex-col md:max-w-[400px]">
          <h3 className="text-lg font-bold mb-2 mr-2">
            <span className="mr-4">Add Payment Method</span>
            <Link
              className="p-0 cursor-pointer hover:underline"
              onClick={() => setNewPaymentMethod(getNewMockCardNumber())}
            >
              Mock Credit Card
            </Link>{" "}
          </h3>
          <Card className="mb-2 p-6">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center mb-2">
                <Input
                  className="mb-2"
                  name="cardNumber"
                  placeholder="Card Number"
                  radius="none"
                  readOnly
                  size="lg"
                  endContent={
                    <div className="pointer-events-none flex-shrink-0">
                      {getCardIcon(cardType)}
                    </div>
                  }
                  type="text"
                  value={formatCardNumber(newPaymentMethod)}
                  variant="bordered"
                />
              </div>
              <Input
                className="mb-2"
                name="nameOnCard"
                placeholder="Name on Card"
                radius="none"
                required
                size="lg"
                type="text"
                value={firstName + " " + lastName}
                variant="bordered"
              />
              <div className="flex mb-2">
                <Select
                  className="mr-2"
                  name="expirationMonth"
                  onChange={(e) => setExpirationMonth(e.target.value)}
                  radius="sm"
                  placeholder="Month"
                  value={expirationMonth}
                  variant="bordered"
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
                  name="expirationYear"
                  onChange={(e) => setExpirationYear(e.target.value)}
                  placeholder="Year"
                  radius="sm"
                  value={expirationYear}
                  variant="bordered"
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
              <Checkbox
                name="isDefault"
                className="my-4"
                isSelected={isDefault}
                onValueChange={setIsDefault}
              >
                Make this my default payment method
              </Checkbox>

              <div className="flex justify-end px-6">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button type="submit" color="primary">
                  Save
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </section>
  );
}
