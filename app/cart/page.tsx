// app/cart/page.tsx
"use client";

import React from "react";
import { useStore } from "@tanstack/react-store";
import { cartStore, removeItem, updateQuantity } from "@/stores/cartStore";
import Link from "next/link";
import Image from "next/image";
import { Button, Input } from "@nextui-org/react";
import PlaceholderImage from "@/components/PlaceholderImage";
import { useFullScreenModal } from "@/contexts/FullScreenModalContext";
import { IBook } from "@/interfaces/IBook";
import BookDetails from "@/components/BookDetails";
import { GoogleBook } from "@/interfaces/GoogleBook";
import { fetchBookDetails } from "@/utils/bookApi";
import { fetchBookFromSupabase } from "@/utils/bookFromSupabaseApi";

const CartPage = () => {
  const { openModal } = useFullScreenModal();

  const cartItems = useStore(cartStore, (state) => state.items) as IBook[];
  const total = cartItems.reduce(
    (sum, item) => sum + (item.list_price || 0) * item.quantity,
    0
  );

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(id, quantity);
    } else {
      removeItem(id);
    }
  };
  const handleBookClick = async (book: IBook) => {
    try {
      // fetch book details from supabase
      const supabaseBook = await fetchBookFromSupabase<IBook>(book.id);

      // fetch additional book details from Google Books API
      const googleBookDetails = await fetchBookDetails<GoogleBook>(book.id);

      const bookDetails = {
        ...supabaseBook,
        ...googleBookDetails,
      };

      const bookTitle = `${book.title}`;

      openModal(
        <BookDetails
          bookDetails={bookDetails}
          selectedBook={book}
          imageLink={book.small_thumbnail_image_link || ""}
        />,
        bookTitle
      );
    } catch (error) {
      console.error("Error fetching book details:", error);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="mb-4">
          Looks like you have not added any items to your cart yet.
        </p>
        <Link href="/" className="text-blue-500 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Your Shopping Cart</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center border-b py-4">
              {item.is_promotion ? (
                <Image
                  src={item.small_thumbnail_image_link}
                  alt={item.title}
                  width={50}
                  height={75}
                  className="object-cover mr-4"
                />
              ) : (
                <div className="mr-4">
                  <PlaceholderImage />
                </div>
              )}
              <div className="flex-grow min-w-0">
                <Link
                  className="font-semibold text-sm cursor-pointer text-blue-500 hover:underline line-clamp-2"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleBookClick(item);
                  }}
                >
                  {item.title}
                </Link>
                <p className="">by {item.authors}</p>
                <p className="">${item.list_price?.toFixed(2)}</p>
              </div>
              <div className="flex items-center">
                <Button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity - 1)
                  }
                >
                  -
                </Button>
                <Input
                  className="w-16 mx-2 text-center"
                  type="number"
                  onChange={(e) =>
                    handleQuantityChange(item.id, parseInt(e.target.value))
                  }
                  min="1"
                />
                <Button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity + 1)
                  }
                >
                  +
                </Button>
              </div>
              <p className="ml-4 font-semibold">
                ${((item.list_price || 0) * item.quantity).toFixed(2)}
              </p>
              <Button
                variant="light"
                color="danger"
                className="ml-4"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <div className="md:w-1/3">
          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
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
            <Button className="w-full mt-6" color="primary">
              Proceed to Checkout
            </Button>
          </div>
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Have a promo code?</h3>
            <div className="flex">
              <Input placeholder="Enter code" className="flex-grow" />
              <Button className="ml-2">Apply</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-blue-500 hover:underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
