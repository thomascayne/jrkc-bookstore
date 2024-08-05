// components/CartContent.tsx
import React, { useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { fetchBookFromSupabase } from "@/utils/bookFromSupabaseApi";
import { fetchBookDetails } from "@/utils/bookApi";
import { IBook } from "@/interfaces/IBook";
import { GoogleBook } from "@/interfaces/GoogleBook";
import BookDetails from "@/components/BookDetails";
import { useFullScreenModal } from "@/contexts/FullScreenModalContext";
import { useSidePanel } from "@/contexts/SidePanelContext";
import { useRouter } from "next/navigation";
import PlaceholderImage from "@/components/PlaceholderImage";
import InputButtonGroup from "@/components/CartInputGroup";
import { IoMdClose } from "react-icons/io";
import {
  cartStore,
  fetchCart,
  removeItem,
  updateQuantity,
  getTotal,
} from "@/stores/cartStore";
import { useStore } from "@tanstack/react-store";

interface CartSidePanelProps {
  currentPath: string;
}

/**
 * A functional component that represents the content of the shopping cart.
 * It displays the list of items in the cart, their prices, and allows the user to update the quantity or remove items.
 * It also provides buttons to checkout or continue shopping.
 *
 * @param {CartSidePanelProps} currentPath - The current path of the application.
 * @return {JSX.Element} The JSX element representing the cart content.
 */
const CartContent: React.FC<CartSidePanelProps> = ({ currentPath }) => {
  const cartItems = useStore(cartStore, (state) => state.items);
  const totalPrice = useStore(cartStore, getTotal);

  const { openModal } = useFullScreenModal();
  const { closeRightPanel } = useSidePanel();
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleCheckout = () => {
    closeRightPanel();
    router.push("/cart");
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(id, quantity);
    } else {
      removeItem(id);
    }
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

      const bookTitle = `${book.title}`;

      openModal(<BookDetails bookId={book.id} />, bookTitle);
    } catch (error) {
      console.error("Error fetching book details:", error);
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">Your Shopping Cart</h2>
        <button
          onClick={closeRightPanel}
          className="text-2xl hover:text-red-500 transition-all duration-300 ease-in-out"
        >
          <IoMdClose />
        </button>
      </CardHeader>
      <CardBody className="p-4 overflow-y-auto">
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
            <div className="cart-content-wrapper p-4">
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
                      {item.book.small_thumbnail_image_link ? (
                        <Image
                          src={item.book.small_thumbnail_image_link}
                          alt={item.book.title}
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
                          className="inline-block mb-2 font-semibold text-sm cursor-pointer text-blue-500 hover:underline line-clamp-2"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleBookClick(item.book);
                          }}
                        >
                          {item.book.title}
                        </Link>
                        <p className="list_price text-lg">
                          {item.book.is_promotion &&
                          item.book.discount_percentage ? (
                            <>
                              <span className="text-gray-400 line-through">
                                ${item.book.list_price.toFixed(2)}
                              </span>
                              <span className="ml-2">
                                $
                                {calculateDiscountedPrice(item.book).toFixed(2)}
                              </span>
                              <span className="text-red-500 ml-2">
                                ({item.book.discount_percentage}% off)
                              </span>
                            </>
                          ) : (
                            <span>${item.book.list_price.toFixed(2)}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-center space-x-1">
                        <InputButtonGroup
                          value={item.quantity || 1}
                          onChange={(value) =>
                            handleQuantityChange(item.id, value)
                          }
                          onDecrement={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          onIncrement={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          min={1}
                        />
                        <Link
                          href="#"
                          className="[&:important]:px-0 hover:underline text-red-500 hover:text-red-900 text-sm transition-all duration-200 ease-in-out"
                          onClick={(e) => {
                            e.preventDefault();
                            removeItem(item.id);
                          }}
                        >
                          Remove
                        </Link>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </CardBody>
      {cartItems.length > 0 && (
        <CardFooter className="border-t p-4">
          <div className="w-full flex flex-col">
            <div className="flex justify-between font-semibold mb-4">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="w-full flex-col sm:flex-row flex justify-between gap-4">
              <Button
                radius="none"
                className="w-full bg-gray-200 text-gray-800 py-2"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </Button>
              <Button
                radius="none"
                className="w-full mb-2 bg-blue-500 text-white py-2"
                onClick={() => handleCheckout()}
              >
                Checkout
              </Button>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default CartContent;
