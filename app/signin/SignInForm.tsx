// app/signin/SignInForm.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { SubmitButton } from '@/components/submit-button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@nextui-org/react';
import {
  PasswordValidationResult,
  validatePassword,
} from '@/utils/passwordChecker';
import { initializeCart } from '@/stores/cartStore';
import { getRedirectUrl } from '@/utils/getRedirectUrl';

export default function SignInForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [email, setEmail] = useState('');

  const [isEmailValid, setIsEmailValid] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordMessage, setPasswordMessage] =
    useState<PasswordValidationResult>();

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // User is already signed in, redirect them
        router.replace(getRedirectUrl());
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  const verifyEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsEmailValid(false);
      setErrorMessage('Invalid email address. Please try again.');
      return;
    }

    setIsEmailValid(true);
  };

  const signIn = async (formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsEmailValid(false);
      setErrorMessage('Invalid email address. Please try again.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage('Incorrect email or password. Please try again.');
    } else {
      setSuccessMessage('Signed in successfully. Redirecting...');

      // Initialize the cart after successful sign-in
      await initializeCart();

      /**
       * Redirect to the page specified in the query string or to the home page
       */
      let redirectUrl = '';

      // Get the roles from user metadata
      const roles = user?.app_metadata?.roles || [];

      // Determine where to redirect based on roles
      let redirectPath;

      if (roles.length === 1 && roles[0] === 'USER') {
        // Only users with a single USER role can be customers
        redirectPath = getRedirectUrl();

        console.log('USER redirectPath:', redirectPath);
        // Check if there's an intended action in localStorage
        const intendedAction = localStorage.getItem('intendedAction');
        if (intendedAction === 'checkout') {
          redirectPath = '/checkout';
          localStorage.removeItem('intendedAction'); // Clear the intended action
        }
      } else if (roles.includes('SALES_ASSOCIATE')) {
        redirectPath = '/sales/dashboard';
      } else if (roles.includes('ADMIN')) {
        redirectPath = '/'; ///admin/dashboard'; // Placeholder, update when available
      } else if (roles.includes('INVENTORY_MANAGER')) {
        redirectPath = '/'; ///inventory/dashboard'; // Placeholder, update when available
      } else {
        // For any other role combinations or no roles
        redirectPath = '/access-denied'; // Create this page to explain the situation
      }
      console.log('Got here after redirectPath:', redirectPath);
      
      setTimeout(() => {
        router.replace(redirectUrl);
      }, 100);
    }
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(e.target.value);
    setIsPasswordTouched(true);
  };

  useEffect(() => {
    if (isPasswordTouched) {
      const result = validatePassword(password, '', false);
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
          type={showPassword ? 'text' : 'password'}
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
