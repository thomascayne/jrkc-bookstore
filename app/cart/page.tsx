// app/cart/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@tanstack/react-store';
import {
  calculateDiscountedPrice,
  cartStore,
  getTotal,
  removeItem,
  updateQuantity,
} from '@/stores/cartStore';
import Link from 'next/link';
import Image from 'next/image';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
} from '@nextui-org/react';
import PlaceholderImage from '@/components/PlaceholderImage';
import { useFullScreenModal } from '@/contexts/FullScreenModalContext';
import BookDetails from '@/components/BookDetails';
import { GoogleBook } from '@/interfaces/GoogleBook';
import { fetchBookDetails } from '@/utils/bookApi';
import { fetchBookFromSupabase } from '@/utils/bookFromSupabaseApi';
import InputButtonGroup from '@/components/InputButtonGroup';
import { useRouter } from 'next/navigation';
import CartLoadingSkeleton from '@/components/CartLoadingSkeleton';
import { ICustomerCartItem } from '@/interfaces/ICustomerCart';
import { IBookInventory } from '@/interfaces/IBookInventory';
import { useUserProfile } from '@/hooks/useUserProfile';
import { createClient } from '@/utils/supabase/client';

const CartPage = () => {
  const [isClient, setIsClient] = useState(false);
  const { openFullScreenModal: openFullScreenModal } = useFullScreenModal();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  const cartItems = useStore(
    cartStore,
    (state) => state.items,
  ) as ICustomerCartItem[];
  const router = useRouter();
  const total = useStore(cartStore, getTotal);
  const { profile } = useUserProfile();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      setIsAuthenticated(!!user);
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [supabase.auth]);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(id, quantity);
    } else {
      removeItem(id);
    }
  };

  const handleBookClick = async (book: IBookInventory) => {
    try {
      // fetch book details from supabase
      const supabaseBook = await fetchBookFromSupabase<IBookInventory>(book.id);

      // fetch additional book details from Google Books API
      const googleBookDetails = await fetchBookDetails<GoogleBook>(book.id);

      const bookDetails = {
        ...supabaseBook,
        ...googleBookDetails,
      };

      const bookTitle = `${book.title}`;

      openFullScreenModal(<BookDetails bookId={book.id} />, bookTitle);
    } catch (error) {
      console.error('Error fetching book details:', error);
    }
  };

  if (!isClient || isLoading) {
    return <CartLoadingSkeleton />;
  }

  if (cartItems.length === 0) {
    return (
      <section className="container flex flex-col items-center w-full mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">
          Your Bookstore Cart is Empty
        </h1>
        <p className="mb-4">
          Looks like you have not added any items to your cart yet.
        </p>
        <Link
          href="/"
          className="text-blue-500 hover:underline"
          onClick={(e) => handleContinueShopping(e)}
        >
          Continue Shopping
        </Link>
      </section>
    );
  }

  const handleContinueShopping = (
    e:
      | React.MouseEvent<HTMLAnchorElement>
      | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();

    const lastVisitedPath = localStorage.getItem('lastVisitedPath') || '/';
    router.push(lastVisitedPath);
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      localStorage.setItem('intendedAction', 'checkout');
      router.push('/signin');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Your Shopping Cart</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3 shadow-medium rounded-large py-2 outline-none transition-transform-background bg-content1 text-background box-border">
          {cartItems.map((item) => (
            <div
              id={item.book_id}
              key={item.book_id}
              className="flex items-center border-b border-gray-300 dark:border-gray-600 py-4 px-4"
            >
              {item.book.is_promotion &&
              item.book.small_thumbnail_image_link ? (
                <div className="relative h-[75px] w-[50px] mr-4">
                  <Image
                    src={item.book.small_thumbnail_image_link}
                    alt={item.book.title}
                    className="object-cover mr-4"
                    layout="fill"
                  />
                </div>
              ) : (
                <div className="mr-4">
                  <PlaceholderImage />
                </div>
              )}
              <div className="flex-grow min-w-0 max-w-[560px]">
                <Link
                  className="inline-block font-semibold text-sm cursor-pointer text-blue-500 hover:underline line-clamp-2"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleBookClick(item.book);
                  }}
                >
                  {item.book.title}
                </Link>
                <p className="">by {item.book.authors}</p>
                <p className="list_price text-lg">
                  {item.book.is_promotion && item.book.discount_percentage ? (
                    <>
                      <span className="text-gray-400 line-through">
                        ${item.book.list_price.toFixed(2)}
                      </span>
                      <span className="ml-2">
                        ${calculateDiscountedPrice(item.book).toFixed(2)}
                      </span>
                      <span className="text-red-500 ml-2">
                        ({item.book.discount_percentage}% off)
                      </span>
                    </>
                  ) : (
                    <span>${item.book.list_price.toFixed(2)}</span>
                  )}
                </p>

                {/* <p className="">${item.list_price?.toFixed(2)}</p> */}
              </div>
              <div className="flex items-center mr-4">
                <InputButtonGroup
                  maxQuantity={item.book.available_quantity}
                  minQuantity={1}
                  onChange={(newValue) =>
                    handleQuantityChange(item.book_id, newValue)
                  }
                  value={item.quantity}
                />
              </div>
              <p className="mx-4 font-semibold">
                ${calculateDiscountedPrice(item.book).toFixed(2)}
              </p>
              <Link
                href="#"
                className="[&:important]:px-0 hover:underline text-red-500 hover:text-red-900 text-sm transition-all duration-200 ease-in-out"
                onClick={(e) => {
                  e.preventDefault();
                  removeItem(item.book_id);
                }}
              >
                Remove
              </Link>
            </div>
          ))}
        </div>
        <div className="md:w-1/3">
          <Card shadow="md" className="mb-4">
            <CardHeader>
              <h2 className="text-xl font-semibold py-2 px-4">Order Summary</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="px-4">
                <div className="flex justify-between my-2">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-4">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Divider className="mt-4" />
              <div className="flex px-4 my-4 justify-center">
                <input
                  type="button"
                  className="inline-block transition-all duration-200 ease-in-out py-2 px-10 rounded cursor-pointer w-full bg-primary-500 hover:bg-primary-300 text-white text-center"
                  id="proceed-to-checkout"
                  onClick={handleProceedToCheckout}
                  value="Proceed to checkout"
                />
              </div>
            </CardBody>
          </Card>
          <Card shadow="md">
            <CardHeader>
              <h3 className="font-semibold px-4 mt-4">Have a promo code?</h3>
            </CardHeader>
            <Divider className="my-4" />
            <CardBody>
              <div className="flex px-4 mb-4">
                <Input
                  placeholder="Enter code"
                  className="flex-grow"
                  radius="none"
                />
                <Button className="ml-2" radius="none">
                  Apply
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
      <div className="mt-8">
        <Button
          onClick={(e) => handleContinueShopping(e)}
          className="bg-primary-500 hover:bg-primary-700 rounded-none text-white px-6 text-lg py-2"
        >
          Continue Shopping
        </Button>
      </div>
    </section>
  );
};

export default CartPage;
