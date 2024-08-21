import { ICustomerCartItem } from "@/interfaces/ICustomerCart";
import { IPaymentMethod } from "@/interfaces/IPaymentMethod";
import { UserProfile } from "@/interfaces/UserProfile";
import { Card, CardBody, Divider, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { CardHeader } from "@nextui-org/react";
import React from "react";

interface OrderSummaryProps {
  cartItems: ICustomerCartItem[];
  total: number;
  paymentMethod: IPaymentMethod;
  userProfile: UserProfile;
}

export default function CheckoutOrderSummary({
  cartItems,
  total,
  paymentMethod,
  userProfile,
}: OrderSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2>Order Summary</h2>
      <Table>
        <TableHeader>
          <TableColumn>Item</TableColumn>
          <TableColumn>Quantity</TableColumn>
          <TableColumn>Price</TableColumn>
        </TableHeader>
        <TableBody>
          {cartItems.map((item) => (
            <TableRow key={item.book_id}>
              <TableCell>{item.book.title}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>${item.book.list_price * item.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <p>Total: ${total}</p>

      <div className="billing-shipping-address-from-profile flex flex-col md:flex-row gap-4">
        <Card className="w-96 mb-8">
          <CardHeader>
            <h3 className="font-bold my-4"> Billing Address</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="profile-first-name-last-name">{`${userProfile?.first_name} ${userProfile?.last_name}`}</p>
            <p className="profile-street-address">
              {userProfile?.street_address1}
            </p>
            <p className="profile-city-state-zip">{`${userProfile?.city}, ${userProfile?.state} ${userProfile?.zipcode}`}</p>
          </CardBody>
        </Card>

        <Card className="w-96 mb-8">
          <CardHeader>
            <h3 className="font-bold my-4">Shipping Address</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="profile-first-name-last-name">{`${userProfile?.first_name} ${userProfile?.last_name}`}</p>
            <p className="profile-street-address">
              {userProfile?.street_address1}
            </p>
            <p className="profile-city-state-zip">{`${userProfile?.city}, ${userProfile?.state} ${userProfile?.zipcode}`}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <h3>Payment Method</h3>
          <p>{paymentMethod.card_type}</p>
          {paymentMethod.card_type === "credit_card" && (
            <p>Card ending in {paymentMethod.card_last4}</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
