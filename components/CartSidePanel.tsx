// components/CartSidePanel.tsx

import React from "react";
import { useStore } from "@tanstack/react-store";
import {
  cartStore,
  removeItem,
  updateQuantity,
  getTotal,
} from "@/stores/cartStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSidePanel } from "@/contexts/SidePanelContext";
import PlaceholderImage from "./PlaceholderImage";
import Link from "next/link";
import { Button } from "@nextui-org/react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useFullScreenModal } from "@/contexts/FullScreenModalContext";
import { IBook } from "@/interfaces/IBook";
import BookDetails from "@/components/BookDetails";
import { GoogleBook } from "@/interfaces/GoogleBook";
import { fetchBookDetails } from "@/utils/bookApi";
import { fetchBookFromSupabase } from "@/utils/bookFromSupabaseApi";

interface CartSidePanelProps {
  currentPath: string;
}

const CartSidePanel: React.FC<CartSidePanelProps> = ({ currentPath }) => {
  const { closeRightPanel } = useSidePanel();
  const cartItems = useStore(cartStore, (state) => state.items);
  const router = useRouter();
  const totalPrice = getTotal();
  const { openModal } = useFullScreenModal();

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(id, quantity);
    } else {
      removeItem(id);
    }
  };

  const handleCheckout = () => {
    closeRightPanel();
    router.push("/cart");
  };

  const handleContinueShopping = () => {
    closeRightPanel();
    if (currentPath !== "/cart") {
      router.push(currentPath);
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

  return (
    <div className="cart-side-panel p-4">
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Your cart is empty.
          </h1>
          <Button
            className="text-center bg-primary-500 text-white font-bold px-4"
            onClick={handleContinueShopping}
          >
            Start adding books to your cart.
          </Button>
        </div>
      ) : (
        <>
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start space-x-4 mb-2 sm:[&:not(:first-child)]:pt-2 [&:not(:first-child)]:border-t  border-gray-300 dark:border-gray-600"
            >
              {item.small_thumbnail_image_link ? (
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
                <p className="text-sm text-gray-600 mt-1">
                  ${item.list_price?.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  className="rounded-full flex items-center justify-center px-0"
                  color="primary"
                  disableRipple
                  isIconOnly
                  onClick={() =>
                    handleQuantityChange(item.id, (item.quantity || 1) - 1)
                  }
                  variant="solid"
                >
                  <FaMinus className="text-sm" />
                </Button>
                <span className="w-6 text-center">{item.quantity || 1}</span>
                <Button
                  className="rounded-full flex items-center justify-center px-0"
                  color="primary"
                  disableRipple
                  isIconOnly
                  onClick={() =>
                    handleQuantityChange(item.id, (item.quantity || 1) + 1)
                  }
                  variant="solid"
                >
                  <FaPlus className="text-sm" />
                </Button>
              </div>
            </div>
          ))}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <Button
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded"
            onClick={() => handleCheckout()}
          >
            Checkout
          </Button>
          <Button
            className="w-full mt-2 bg-gray-200 text-gray-800 py-2 rounded"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </Button>
        </>
      )}
    </div>
  );
};

export default CartSidePanel;
