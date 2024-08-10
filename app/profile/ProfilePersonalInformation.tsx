// app/profile/ProfilePersonalInformation.tsx

"use client";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { Input } from "@nextui-org/input";
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { createClient } from "@/utils/supabase/client";
import useSignOut from "@/hooks/useSignOut";
import {
  PasswordValidationResult,
  validatePassword,
} from "@/utils/passwordChecker";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/interfaces/UserProfile";
import {
  validateAndFormatPhone,
  PhoneValidationResult,
} from "@/utils/phoneValidation";
import { waitSomeTime } from "@/utils/wait-some-time";

interface PersonalInfoProps {
  user: User | null;
}

export default function ProfilePersonalInformation({ user }: PersonalInfoProps) {
  const router = useRouter();
  const signOut = useSignOut();
  const supabase = createClient();

  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [emailMessage, setEmailMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isPhoneChanged, setIsPhoneChanged] = useState(false);
  const [lastName, setLastName] = useState("");
  const [nameMessage, setNameMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] =
    useState<PasswordValidationResult>();
  const [phone, setPhone] = useState("");
  const [phoneMessage, setPhoneMessage] = useState<PhoneValidationResult>();
  const [profileData, setProfileData] = useState<UserProfile>();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
        setPhone(data?.phone || "");
        setProfileData(data);
      }
    }

    fetchUserProfile();
  }, [user, supabase]);

  useEffect(() => {
    setIsEmailChanged(email !== user?.email);
  }, [email, user]);

  useEffect(() => {
    setIsPhoneChanged(phone !== profileData?.phone);
  }, [phone, profileData]);

  useEffect(() => {
    if (isPasswordTouched) {
      const result = validatePassword(newPassword, confirmPassword, true);
      setPasswordMessage(result);
      setIsPasswordValid(result.isValid);
    }
  }, [newPassword, confirmPassword, isPasswordTouched]);

  const handlePhoneUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      setPhoneMessage({ isValid: false, text: "Please enter a phone number." });
      return;
    }

    const { isValid, formattedNumber, text } = validateAndFormatPhone(phone);

    if (!isValid) {
      setPhoneMessage(
        { isValid, formattedNumber, text } || {
          isValid: false,
          error: "Please enter a valid phone number.",
        }
      );
      return;
    }

    // Update phone in auth.users
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ phone: formattedNumber })
      .eq("id", user?.id)
      .select("*")
      .maybeSingle();

    if (profileError) {
      setPhoneMessage({
        isValid: false,
        text: "Failed to update phone number in profile. Please try again.",
      });
      return;
    }

    setPhone(formattedNumber!);
    setPhoneMessage({
      isValid: true,
      text: "Phone number updated successfully.",
    });

    waitSomeTime(3000);
    setPhoneMessage({});
  };

  const handlePersonalInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName })
      .eq("id", user?.id)
      .select("*")
      .maybeSingle();

    if (error) {
      setNameMessage(
        "Failed to update personal information. Please try again."
      );
    } else {
      setProfileData(data);
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setNameMessage("Personal information updated successfully.");

      waitSomeTime(9000);
      setNameMessage("");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordMessage({
        isValid: false,
        message: "Failed to update password. Please try again.",
      });
    } else {
      setPasswordMessage({
        isValid: false,
        message: "Password updated successfully. Please sign in again.",
      });

      waitSomeTime(3000);
      signOut();
      router.push("/signin");
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailMessage("Invalid email address. Please try again.");
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      email: email,
    });

    if (error) {
      setEmailMessage("Failed to update email. Please try again.");
    } else {
      setIsEmailChanged(false);
      setEmailMessage(
        "Email update request sent. Please check your new email. You will need to confirm your new email before you can sign in."
      );

      waitSomeTime(3000);
      signOut();
      router.push("/signin");
    }
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
    setIsPasswordTouched(true);
  };

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="md:flex md:space-x-8">
        <div className="lg:w-1/2 md:flex md:flex-col mb-8 ">
          <Card
            className="personal-information-form-wrapper p-6 flex-grow md:min-h-[400px]"
            shadow="md"
          >
            <CardHeader>
              <h2 className="text-xl font-bold mb-2">
                Your First and Last Name
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handlePersonalInfoUpdate} className="space-y-4">
                <div className="flex flex-col flex-grow gap-4">
                  <Input
                    className="mb-2"
                    label="First Name"
                    radius="none"
                    type="text"
                    variant="bordered"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input
                    className="mb-2"
                    label="Last Name"
                    radius="none"
                    type="text"
                    variant="bordered"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <Button
                  className="px-4"
                  color="primary"
                  radius="sm"
                  type="submit"
                  isDisabled={
                    firstName === profileData?.first_name &&
                    lastName === profileData?.last_name
                  }
                >
                  Update
                </Button>
              </form>
              {nameMessage && (
                <p
                  className={`mt-2 ${
                    nameMessage.includes("Failed")
                      ? "text-red-500"
                      : "text-green-500 opacity-[1] transition-all ease-in-out duration-[1s]"
                  } ${nameMessage === "" ? "opacity-0" : ""}`}
                >
                  {nameMessage}
                </p>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="lg:w-1/2 md:flex md:flex-col mb-8">
          <Card
            className="password-form-wrapper p-6 shadow-all-sides flex-grow md:min-h-[400px]"
            shadow="md"
          >
            <CardHeader>
              <h2 className="text-xl font-bold mb-2">Change Password</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Input
                      className="mb-2"
                      label="Current Password"
                      radius="none"
                      type={showCurrentPassword ? "text" : "password"}
                      variant="bordered"
                      value={currentPassword}
                      onChange={(e) =>
                        handlePasswordInputChange(e, setCurrentPassword)
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="text-blue-500 underline mr-2 absolute right-0 top-[18px]"
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <div className="relative flex flex-col gap-1">
                    <Input
                      className="mb-2"
                      label="New Password"
                      radius="none"
                      type={showNewPassword ? "text" : "password"}
                      variant="bordered"
                      value={newPassword}
                      onChange={(e) =>
                        handlePasswordInputChange(e, setNewPassword)
                      }
                    />
                    <p className="text-sm text-gray-600">
                      Should not be the same as email or login password
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-blue-500 underline mr-2 absolute right-0 top-[20px]"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <div className="relative flex flex-col gap-1">
                    <Input
                      className="mb-2"
                      label="Confirm New Password"
                      radius="none"
                      type={showConfirmPassword ? "text" : "password"}
                      variant="bordered"
                      value={confirmPassword}
                      onChange={(e) =>
                        handlePasswordInputChange(e, setConfirmPassword)
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-blue-500 underline mr-2 absolute right-0 top-[18px]"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <p
                  className={`text-gray-600 ${
                    !passwordMessage?.isValid
                      ? "font-fold text-red-600"
                      : passwordMessage?.isValid
                      ? "font-fold text-green-600"
                      : ""
                  }`}
                >
                  {!passwordMessage?.isValid
                    ? passwordMessage?.message
                    : passwordMessage?.isValid
                    ? passwordMessage?.message
                    : "Upon updating your password, you will need to sign in again"}
                </p>
                <Button
                  className="px-4"
                  color="primary"
                  radius="sm"
                  type="submit"
                  isDisabled={!isPasswordValid}
                >
                  Update Password
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="md:flex md:space-x-8">
        <div className="lg:w-1/2 md:flex md:flex-col mb-8">
          <Card
            className="email-form-wrapper p-6 flex-grow md:min-h-[200px]"
            shadow="md"
          >
            <CardHeader>
              <h2 className="text-xl font-bold mb-2">Your Email</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div className="flex flex-col">
                  <Input
                    className="mb-2"
                    label="Email"
                    radius="none"
                    type="email"
                    variant="bordered"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button
                  className="px-4"
                  color="primary"
                  radius="sm"
                  type="submit"
                  isDisabled={!isEmailChanged}
                >
                  Update Email
                </Button>
              </form>
              {emailMessage && (
                <div
                  className={`mt-2 ${
                    emailMessage.includes("Failed")
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {emailMessage}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="lg:w-1/2 md:flex md:flex-col mb-8">
          <Card
            className="email-form-wrapper p-6 flex-grow md:min-h-[200px]"
            shadow="md"
          >
            <CardHeader>
              <h2 className="text-xl font-bold mb-2">Phone Number</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handlePhoneUpdate} className="space-y-4">
                <div className="flex flex-col">
                  <Input
                    className="mb-2"
                    label="Phone"
                    onChange={(e) => setPhone(e.target.value)}
                    radius="none"
                    type="tel"
                    value={phone}
                    variant="bordered"
                  />
                </div>
                <Button
                  className="px-4"
                  color="primary"
                  radius="sm"
                  type="submit"
                  isDisabled={!isPhoneChanged}
                >
                  Update Phone
                </Button>
              </form>
              <p
                className={`text-gray-600 ${
                  !phoneMessage?.isValid
                    ? "font-fold text-red-600"
                    : phoneMessage?.isValid
                    ? "font-fold text-green-600"
                    : ""
                }`}
              >
                {!phoneMessage?.isValid
                  ? phoneMessage?.text
                  : phoneMessage?.isValid
                  ? phoneMessage?.text
                  : ""}
              </p>
              {phoneMessage?.isValid && isPhoneChanged && (
                <div
                  className={`mt-2 ${
                    phoneMessage.isValid ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {phoneMessage.text}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
