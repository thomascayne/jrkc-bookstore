// app/signin/SignInForm.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { SubmitButton } from "@/components/submit-button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@nextui-org/react";
import {
  PasswordValidationResult,
  validatePassword,
} from "@/utils/passwordChecker";
import { PhoneValidationResult } from "@/utils/phoneValidation";
import { initializeCart } from "@/stores/cartStore";
import { getRedirectUrl } from '@/utils/getRedirectUrl';  // Import the function

export default function SignInForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [email, setEmail] = useState("");

  const [isEmailValid, setIsEmailValid] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] =
    useState<PasswordValidationResult>();

  const router = useRouter();
  const supabase = createClient();

  const verifyEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsEmailValid(false);
      setErrorMessage("Invalid email address. Please try again.");
      return;
    }

    setIsEmailValid(true);
  };

  const signIn = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsEmailValid(false);
      setErrorMessage("Invalid email address. Please try again.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    const { data: {user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setErrorMessage("Incorrect email or password. Please try again.");
    } else {
      setSuccessMessage("Signed in successfully. Redirecting...");

      // Initialize the cart after successful sign-in
      await initializeCart();

      const params = new URLSearchParams(window.location.search);

      /**
       * Redirect to the page specified in the query string or to the home page
       */
      const redirectUrl = getRedirectUrl();

      /**
       * Direct according to role[]. The basic role is 'USER'. it 'USER' is the only role then the user is a 'customer'
       * 
       * So far the roles are:
       * - ADMIN
       * - INVENTORY_MANAGER
       * - SALES_ASSOCIATE
       * - USER
       * 
       * If there is no role, direct to redirectUrl
       * 
       * user is already authenticated here
       * now write to redirect according to role in user metadata
       */

    // Get the roles from user metadata
    const roles = user?.app_metadata?.roles || [];

    // Determine where to redirect based on roles
    let redirectPath;

    if (roles.length === 0 || (roles.length === 1 && roles[0] === 'USER')) {
      // If no roles or only USER role, use the default redirect URL
      redirectPath = getRedirectUrl();
    } else {
      // If there are additional roles, redirect to the appropriate dashboard
      // Prioritize roles in this order: ADMIN, INVENTORY_MANAGER, SALES_ASSOCIATE
      
      // if (roles.includes('ADMIN')) {
      //   redirectPath = '/admin/dashboard';
      // } else if (roles.includes('INVENTORY_MANAGER')) {
      //   redirectPath = '/inventory/dashboard';
      // } else 
      if (roles.includes('SALES_ASSOCIATE')) {
        redirectPath = '/sales/dashboard';
      } else {
        // If none of the above roles are present, use the default redirect URL
        redirectPath = getRedirectUrl();
      }
    }
      
      
      

      router.push(redirectUrl);
    }
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
    setIsPasswordTouched(true);
  };

  useEffect(() => {
    if (isPasswordTouched) {
      const result = validatePassword(password, "", false);
      setPasswordMessage(result);
      setIsPasswordValid(result.isValid);
    }
  }, [password, isPasswordTouched]);

  return (
    <form className="signin-form flex flex-col w-full justify-center gap-4 text-foreground">
      {errorMessage && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <div>
        <Input
          aria-label="Email"
          className="mb-2"
          id="email"
          label="Email"
          name="email"
          onBlur={verifyEmail}
          onChange={(e) => setEmail(e.target.value)}
          radius="none"
          required
          type="email"
          value={email}
          variant="bordered"
        />
      </div>
      <div className="relative">
        <Input
          aria-label="Password"
          className="mb-2"
          id="password"
          label="Password"
          name="password"
          onChange={(e) => handlePasswordInputChange(e, setPassword)}
          radius="none"
          required
          type={showPassword ? "text" : "password"}
          value={password}
          variant="bordered"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-blue-500 underline mr-2 absolute right-0 top-[20px] text-lg"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      <SubmitButton
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        formAction={signIn}
        isDisabled={
          !isPasswordValid || passwordMessage?.isValid !== true || !isEmailValid
        }
        pendingText="Signing In..."
      >
        Sign In
      </SubmitButton>
      <div className="text-sm text-center mt-4">
        <Link
          href="/reset-password"
          className="text-blue-600 hover:text-blue-800"
        >
          Forgot your password?
        </Link>
      </div>
      <div className="text-sm text-center">
        <Link href="/signup" className="text-blue-600 hover:text-blue-800">
          Do not have an account? Sign up
        </Link>
      </div>
    </form>
  );
}
