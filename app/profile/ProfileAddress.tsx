"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { FaChevronUp, FaPencilAlt, FaPlus } from "react-icons/fa";
import { Button, Card, Input } from "@nextui-org/react";
import { User } from "@supabase/supabase-js";
import { BillingAddress } from "../../interfaces/BillingAddress";
import { ShippingAddress } from "@/interfaces/ShippingAddress";
import { UserProfile } from "@/interfaces/UserProfile";

interface AddressProps {
  user: User | null;
}

export default function ProfileAddress({ user }: AddressProps) {
  const emptyBillingAddress: BillingAddress = {
    street_address1: "",
    street_address2: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  };

  const emptyShippingAddress: ShippingAddress = {
    shipping_first_name: "",
    shipping_last_name: "",
    shipping_street_address1: "",
    shipping_street_address2: "",
    shipping_city: "",
    shipping_state: "",
    shipping_zipcode: "",
    shipping_country: "",
    shipping_phone: "",
  };

  const [profileData, setProfileData] = useState<UserProfile>();
  const [showBillingAddressForm, setShowBillingAddressForm] = useState(false);
  const [showShippingAddressForm, setShowShippingAddressForm] = useState(false);

  const supabase = createClient();

  const [billingAddress, setBillingAddress] =
    useState<BillingAddress>(emptyBillingAddress);

  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress>(emptyShippingAddress);

  const fillAddressByType = (
    address: BillingAddress | ShippingAddress,
    type: "billing" | "shipping"
  ) => {
    if (type === "billing") {
      const billingAddress = address as BillingAddress;
      setBillingAddress({
        street_address1: billingAddress.street_address1 || "",
        street_address2: billingAddress.street_address2 || "",
        city: billingAddress.city || "",
        state: billingAddress.state || "",
        zipcode: billingAddress.zipcode || "",
        country: billingAddress.country || "",
        phone: billingAddress.phone || "",
      });
    } else {
      const shippingAddress = address as ShippingAddress;
      setShippingAddress({
        shipping_first_name: shippingAddress.shipping_first_name || "",
        shipping_last_name: shippingAddress.shipping_last_name || "",
        shipping_street_address1:
          shippingAddress.shipping_street_address1 || "",
        shipping_street_address2:
          shippingAddress.shipping_street_address2 || "",
        shipping_city: shippingAddress.shipping_city || "",
        shipping_state: shippingAddress.shipping_state || "",
        shipping_zipcode: shippingAddress.shipping_zipcode || "",
        shipping_country: shippingAddress.shipping_country || "",
        shipping_phone: shippingAddress.shipping_phone || "",
      });
    }
  };

  useEffect(() => {
    async function getUserAddresses() {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (profile) {
        setProfileData(profile);
        fillAddressByType(profile, "billing");
        fillAddressByType(profile, "shipping");
      }
    }

    getUserAddresses();
  }, [supabase, user?.id]);

  const isBillingAddressEmpty = (address: any) => {
    if (!address) return true;
    const requiredFields = [
      "street_address1",
      "city",
      "state",
      "zipcode",
      "country",
    ];
    return requiredFields.some((field) => !address[field]);
  };

  const isShippingAddressEmpty = (address: any) => {
    if (!address) return true;
    const requiredFields = [
      "shipping_first_name",
      "shipping_last_name",
      "shipping_street_address1",
      "shipping_street_address2",
      "shipping_city",
      "shipping_state",
      "shipping_zipcode",
      "shipping_country",
    ];
    return requiredFields.some((field) => !address[field]);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
    type: "billing" | "shipping"
  ) => {
    event.preventDefault();

    if (type === "billing") {
      setBillingAddress(billingAddress);
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .update(billingAddress)
          .eq("id", user?.id)
          .select("*")
          .maybeSingle();

        if (profile) {
          fillAddressByType(profile, "billing");
        }
      } catch (error) {
        console.error("Error updating billing address:", error);
      }

      setShowBillingAddressForm(false);
    }

    if (type === "shipping") {
      setShippingAddress(shippingAddress);
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .update(shippingAddress)
          .eq("id", user?.id)
          .select("*")
          .maybeSingle();

        if (profile) {
          fillAddressByType(profile, "shipping");
        }
      } catch (error) {
        console.error("Error updating shipping address:", error);
      }

      setShowShippingAddressForm(false);
    }
  };

  return (
    <section className="flex flex-col px-4">
      <div className="md:flex md:space-x-4">
        <div className="flex flex-col lg:w-1/2 md:flex md:flex-col mb-8">
          <div className="flex mb-4 mt-8">
            <h2 className="text-xl font-bold mb-2 mr-8 my-auto items-center">
              <span>Billing Address</span>
              {isBillingAddressEmpty(billingAddress) &&
                !showBillingAddressForm && (
                  <button
                    className="bg-green-500 text-white px-2 py-2 ml-4 rounded-full hover:bg-green-700 transition-all duration-200 ease-in-out"
                    onClick={() => setShowBillingAddressForm(true)}
                  >
                    <FaPlus />
                  </button>
                )}
              {isBillingAddressEmpty(billingAddress) &&
                showBillingAddressForm && (
                  <button
                    className="bg-green-500 text-white px-2 py-2 ml-4 rounded-full hover:bg-green-700 transition-all duration-200 ease-in-out"
                    onClick={() => setShowBillingAddressForm(false)}
                  >
                    <FaChevronUp />
                  </button>
                )}
            </h2>
          </div>

          {isBillingAddressEmpty(billingAddress) && !showBillingAddressForm && (
            <Card className="mb-2 flex flex-wrap md:max-w-xl shadow-all-sides">
              <div className="flex flex-col my-6 px-6">
                <div className="w-full">{`${profileData?.first_name} ${profileData?.last_name}`}</div>
                <div className="w-full">{billingAddress.street_address1}</div>
                <div className="w-full">{billingAddress.street_address2}</div>
                <div className="flex w-full">
                  {billingAddress.city} {billingAddress.state}{" "}
                  {billingAddress?.zipcode}
                </div>
                <div className="w-full">{billingAddress?.phone}</div>
              </div>
              <div className="w-full border-t border-gray-200 dark:border-gray-600 py-4 px-6">
                <button
                  className="flex hover:text-yellow-500 items-center"
                  onClick={() => setShowBillingAddressForm(true)}
                >
                  <FaPencilAlt className="mr-2 text-yellow-500" /> Edit
                </button>
              </div>
            </Card>
          )}
          {showBillingAddressForm && (
            <Card className="mb-2 flex flex-wrap md:max-w-xl shadow-all-sides">
              <div className="w-full my-6 px-4">
                <form onSubmit={(e) => handleSubmit(e, "billing")}>
                  <Input
                    className="mb-2"
                    label="Street Address 1"
                    name={billingAddress.street_address1}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        street_address1: e.target.value,
                      })
                    }
                    value={billingAddress.street_address1}
                  />
                  <Input
                    className="mb-2"
                    label="Street Address 2"
                    name={billingAddress.street_address2}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        street_address2: e.target.value,
                      })
                    }
                    value={billingAddress.street_address2}
                  />
                  <Input
                    className="mb-2"
                    label="City"
                    name={billingAddress.city}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        city: e.target.value,
                      })
                    }
                    value={billingAddress.city}
                  />
                  <Input
                    className="mb-2"
                    label="State"
                    name={billingAddress.state}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        state: e.target.value,
                      })
                    }
                    value={billingAddress.state}
                  />
                  <Input
                    className="mb-2"
                    label="ZIP Code"
                    name={billingAddress.zipcode}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        zipcode: e.target.value,
                      })
                    }
                    value={billingAddress.zipcode}
                  />
                  <Input
                    className="mb-2"
                    label="Phone"
                    name={billingAddress.phone}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        phone: e.target.value,
                      })
                    }
                    value={billingAddress.phone}
                  />
                  <div className="flex justify-end mt-4">
                    <Button
                      color="danger"
                      variant="light"
                      className="mr-2"
                      onClick={() => {
                        setShowBillingAddressForm(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" color="primary">
                      Save
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}
        </div>
        <div className="lg:w-1/2 md:flex md:flex-col mb-8">
          <div className="flex mb-4 mt-8">
            <h2 className="text-xl font-bold mb-2 mr-8 my-auto">
              <span>Shipping Address</span>
              {isShippingAddressEmpty(shippingAddress) &&
                !showShippingAddressForm && (
                  <button
                    className="bg-green-500 text-white px-2 py-2 ml-4 rounded-full hover:bg-green-700 transition-all duration-200 ease-in-out"
                    onClick={() => setShowShippingAddressForm(true)}
                  >
                    <FaPlus />
                  </button>
                )}
              {isShippingAddressEmpty(shippingAddress) &&
                showShippingAddressForm && (
                  <button
                    className="bg-green-500 text-white px-2 py-2 ml-4 rounded-full hover:bg-green-700 transition-all duration-200 ease-in-out"
                    onClick={() => setShowShippingAddressForm(false)}
                  >
                    <FaChevronUp />
                  </button>
                )}
            </h2>
          </div>

          {isShippingAddressEmpty(shippingAddress) &&
            !showShippingAddressForm && (
              <Card className="flex flex-wrap md:max-w-xl shadow-all-sides mb-4">
                <div className="flex flex-col my-6 px-6">
                  <div className="w-full">{`${shippingAddress.shipping_first_name} ${shippingAddress.shipping_last_name}`}</div>
                  <div className="w-full whitespace-nowrap">
                    {shippingAddress.shipping_street_address1}
                  </div>
                  <div className="w-full whitespace-nowrap">
                    {shippingAddress.shipping_street_address2}
                  </div>
                  <div className="flex w-full whitespace-nowrap">
                    {shippingAddress.shipping_city}{" "}
                    {shippingAddress.shipping_state}{" "}
                    {shippingAddress.shipping_zipcode}
                  </div>
                  <div className="w-full whitespace-nowrap">
                    {shippingAddress.shipping_country}
                  </div>
                  <div className="w-full">{shippingAddress.shipping_phone}</div>
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-600 py-4 px-6">
                  <button
                    className="flex hover:text-yellow-500 items-center"
                    onClick={() => setShowShippingAddressForm(true)}
                  >
                    <FaPencilAlt className="mr-2 text-yellow-500" /> Edit
                  </button>
                </div>
              </Card>
            )}

          {showShippingAddressForm && (
            <Card
              className="mb-4 flex flex-wrap md:max-w-xl shadow-all-sides"
              shadow="md"
            >
              <div className="w-full my-6 px-4">
                <form onSubmit={(e) => handleSubmit(e, "shipping")}>
                  <Input
                    className="mb-2"
                    label="First Name"
                    name={shippingAddress.shipping_first_name}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        shipping_first_name: e.target.value,
                      })
                    }
                    value={shippingAddress.shipping_first_name}
                  />
                  <Input
                    className="mb-2"
                    label="Last Name"
                    name={shippingAddress.shipping_last_name}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        shipping_last_name: e.target.value,
                      })
                    }
                    value={shippingAddress.shipping_last_name}
                  />
                  <Input
                    className="mb-2"
                    label="Street Address 1"
                    name={shippingAddress.shipping_street_address1}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        shipping_street_address1: e.target.value,
                      })
                    }
                    value={shippingAddress.shipping_street_address1}
                  />
                  <Input
                    className="mb-2"
                    label="Street Address 2"
                    name={shippingAddress.shipping_street_address2}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        shipping_street_address2: e.target.value,
                      })
                    }
                    value={shippingAddress.shipping_street_address2}
                  />
                  <Input
                    className="mb-2"
                    label="City"
                    name={shippingAddress.shipping_city}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        shipping_city: e.target.value,
                      })
                    }
                    value={shippingAddress.shipping_city}
                  />
                  <Input
                    className="mb-2"
                    label="State"
                    name={shippingAddress.shipping_state}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        shipping_state: e.target.value,
                      })
                    }
                    value={shippingAddress.shipping_state}
                  />
                  <Input
                    className="mb-2"
                    label="ZIP Code"
                    name={shippingAddress.shipping_zipcode}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        shipping_zipcode: e.target.value,
                      })
                    }
                    value={shippingAddress.shipping_zipcode}
                  />
                  <Input
                    className="mb-2"
                    label="Phone"
                    name={shippingAddress.shipping_phone}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        shipping_phone: e.target.value,
                      })
                    }
                    value={shippingAddress.shipping_phone}
                  />

                  <div className="flex justify-end mt-4">
                    <Button
                      color="danger"
                      variant="light"
                      className="mr-2"
                      onClick={() => {
                        setShowShippingAddressForm(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" color="primary">
                      Save
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}
          <p className="drop-shadow-lg">
            Phone number will be used for shipping communications only
          </p>
        </div>
      </div>
    </section>
  );
}
