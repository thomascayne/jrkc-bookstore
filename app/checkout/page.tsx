// app/checkout/page.tsx

import React, { useState } from "react";
import { Button, Card, CardBody } from "@nextui-org/react";
import CheckoutPaymentForm from "@/components/checkout/CheckoutPaymentForm";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import { useRouter } from "next/navigation";
import { createOrder, cartStore, getTotal } from "@/stores/cartStore";
import { useStore } from "@tanstack/react-store";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ShippingAddress } from "@/interfaces/ShippingAddress";
import { PaymentMethod } from "@/interfaces/IOrder";
import ShippingAddressForm from "@/components/checkout/CheckoutShippingAddressForm";
import { BillingAddress } from "@/interfaces/BillingAddress";
import { IPaymentMethod } from "@/interfaces/IPaymentMethod";

const steps = ["Address", "Payment", "Review"] as const;
type StepType = (typeof steps)[number];

export default function CheckoutCheckoutPage() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<IPaymentMethod | null>(null);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const router = useRouter();
  const cartItems = useStore(cartStore, (state) => state.items);
  const total = getTotal();
  const { profile, isLoading, error } = useUserProfile();
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
    useState<string>("");

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      if (!selectedPaymentMethod || !shippingAddress) {
        console.error("Missing payment method or shipping address");
        return;
      }
      const order = await createOrder(
        selectedPaymentMethod.card_type,
        shippingAddress
      );
      if (order) {
        router.push(`/order-confirmation/${order.id}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  const handlePaymentMethodSelect = (paymentMethod: IPaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
  };

  const getStepContent = (step: number): React.ReactNode => {
    switch (step) {
      case 0:
        return <ShippingAddressForm userProfile={profile} />;
      case 1:
        return (
          <CheckoutPaymentForm
            user={profile}
            onPaymentMethodSelect={handlePaymentMethodSelect} // <-- error here
          />
        );
      case 2:
        return shippingAddress && selectedPaymentMethod ? (
          <CheckoutOrderSummary
            cartItems={cartItems}
            paymentMethod={selectedPaymentMethod}
            total={total}
            userProfile={profile}
          />
        ) : (
          <div>Missing shipping address or payment method</div>
        );
      default:
        return "Unknown step";
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user profile</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-bold mb-4">Checkout</h1>
          <div className="mb-4">
            {steps.map((label, index) => (
              <span
                key={label}
                className={`mr-2 ${index === activeStep ? "font-bold" : ""}`}
              >
                {label} {index < steps.length - 1 && ">"}
              </span>
            ))}
          </div>
          {getStepContent(activeStep)}
          <div className="mt-4">
            {activeStep > 0 && (
              <Button onClick={handleBack} className="mr-2">
                Back
              </Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                color="primary"
                isDisabled={activeStep === 1 && !selectedPaymentMethodId}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handlePlaceOrder}
                color="success"
                isDisabled={!selectedPaymentMethodId}
              >
                Place Order
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
