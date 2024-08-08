// components/checkout/ShippingAddressForm.tsx

import React from "react";
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { UserProfile } from "@/interfaces/UserProfile";

interface ShippingAddressFormProps {
  userProfile: UserProfile | null;
}

/**
 * just display the address as billing and shipping_* address as shipping which both comes from user profile
 * @param param0
 * @returns
 */
export default function ShippingAddressForm({
  userProfile,
}: ShippingAddressFormProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
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
  );
}
