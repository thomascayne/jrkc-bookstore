// app/signin/SignInForm.tsx
'use client';

import type { AppUser } from '@/auth/types';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { SubmitButton } from '@/components/submit-button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@heroui/react';
import {
  PasswordValidationResult,
  validatePassword,
} from '@/utils/passwordChecker';
import { initializeCart } from '@/stores/cartStore';
import { getRedirectUrl } from '@/utils/getRedirectUrl';
import { apiRequest } from '@/utils/apiClient';

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
  useEffect(() => {
    const checkUser = async () => {
      const { user } = await apiRequest<{ user: AppUser | null }>(
        '/api/auth/session',
      );
      if (user) {
        router.push(getRedirectUrl());
      }
    };
    void checkUser();
  }, [router]);

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

    try {
      await apiRequest<{ ok: true }>('/api/auth/signin', {
        body: JSON.stringify({ email, password }),
        method: 'POST',
      });
      const { user } = await apiRequest<{ user: AppUser | null }>(
        '/api/auth/session',
      );
      setSuccessMessage('Signed in successfully. Redirecting...');

      // Initialize the cart after successful sign-in
      await initializeCart();

      // Get the roles from user metadata
      const roles = user?.app_metadata.roles || [];

      // Determine where to redirect based on roles
      let redirectPath = getRedirectUrl() || '/';

      // Only users with a single USER role can be customers
      if (roles.length === 1 && roles[0] === 'USER') {
        // Check if there's an intended action in localStorage
        const intendedAction = localStorage.getItem('intendedAction');
        
        if (intendedAction === 'checkout') {
          redirectPath = '/checkout';
          localStorage.removeItem('intendedAction'); // Clear the intended action
        }
      } else if (roles.includes('INVENTORY_MANAGER')) {
        redirectPath = '/admin/inventory';
      } else if (roles.includes('SALES_ASSOCIATE')) {
        redirectPath = '/sales/dashboard';
      }

      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Incorrect email or password. Please try again.',
      );
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
