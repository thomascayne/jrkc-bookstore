// components/point-of-sale/PointOfSaleRegister.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Card,
  Divider,
  Badge,
  Tooltip,
} from '@nextui-org/react';
import {
  FaSearch,
  FaTrash,
  FaCog,
  FaStickyNote,
  FaCashRegister,
  FaBars,
  FaMinus,
  FaPlus,
} from 'react-icons/fa';
import { IBookInventory } from '@/interfaces/IBookInventory';
import {
  cancelPointOfSaleTransaction,
  fetchPointOfSaleBooks,
} from '@/utils/PointOfSaleApi';
import { BookCardSkeleton } from '@/components/BookCardSkeleton';
import { useFullScreenModal } from '@/contexts/FullScreenModalContext';
import { usePointOfSaleStore } from '@/hooks/usePointOfSaleStore';
import AppLogo from '../AppLogo';
import PointOfSaleRegisterCheckoutModal from '@/components/point-of-sale/PointOfSaleRegisterCheckoutModal';
import PointOfSaleRegisterPaymentProcessingModal from '@/components/point-of-sale/PointOfSaleRegisterPaymentProcessingModal';
import { Elements } from '@stripe/react-stripe-js';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import { useUserProfile } from '@/hooks/useUserProfile'; 

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface TooltipState {
  minus: string;
  plus: string;
}

interface BookWithThumbnail extends IBookInventory {
  thumbnail: string;
  title: string;
}
interface PointOfSaleRegisterProps {
  onExitClick?: () => void;
}

const PointOfSaleRegister: React.FC<PointOfSaleRegisterProps> = ({
  onExitClick,
}) => {
  const [books, setBooks] = useState<BookWithThumbnail[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPendingOrderModalOpen, setIsPendingOrderModalOpen] = useState(false);
  const [isRegisterCollapsed, setIsRegisterCollapsed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tooltips, setTooltips] = useState<Record<string, TooltipState>>({});
  const {
    addItem,
    clearTransaction,
    currentOrder,
    getItemCount,
    getTotal,
    initializeTransaction,
    orderItems,
    removeItem,
    updateQuantity,
  } = usePointOfSaleStore();
  const { openFullScreenModal, closeFullScreenModal } = useFullScreenModal();
  const [returningFromPayment, setReturningFromPayment] = useState(false);
  const [token, setToken] = useState('');
  const { profile, access_token } = useUserProfile();

  useEffect(() => {
    if (!currentOrder) {
      initializeTransaction();
    }
  }, [currentOrder, initializeTransaction]);

  useEffect(() => {
    if (currentOrder && currentOrder.status === 'pending') {
      setIsPendingOrderModalOpen(true);
    }
  }, [currentOrder]);

  useEffect(() => {
    const handleResize = () => {
      setIsRegisterCollapsed(window.innerWidth < 1200);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (access_token) {
      setToken(access_token);
      fetchInitialBooks(access_token);
    }
  }, [access_token]);
  
  const fetchInitialBooks = async (token: string) => {
    setIsInitialLoading(true);
    try {
      const fetchedBooks = await fetchPointOfSaleBooks('', 60, token);
      setBooks(fetchedBooks);
    } catch (error) {
      console.error('Error fetching initial books:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const fetchBooks = async (search?: string) => {
    setIsSearching(true);
    try {
      const fetchedBooks = await fetchPointOfSaleBooks(search, 60, token);
      setBooks(fetchedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchBooks(value);
  };

  const addToRegister = (book: BookWithThumbnail, e: React.MouseEvent) => {
    e.preventDefault();

    if (!currentOrder) {
      initializeTransaction();
    }

    addItem(
      {
        id: book.id,
        price: book.retail_price,
        category_id: book.categoryId,
        isbn13: book.isbn13,
        is_promotion: book.is_promotion,
        discount: book.discount_percentage ? book.discount_percentage / 100 : 0,
        discount_percentage: book.discount_percentage,
      },
      1,
    );
  };

  const removeFromRegister = (id: string) => {
    removeItem(id);
    // Check if the register is empty after removing an item
    // before initializing a new transaction warn clear that register transaction will be marked as cancelled
    if (getItemCount() === 0) {
      initializeTransaction();
    }
  };

  const showTooltip = (id: string, type: 'minus' | 'plus', message: string) => {
    setTooltips((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: message,
      },
    }));

    setTimeout(() => {
      setTooltips((prev) => {
        const newTooltips = { ...prev };
        if (newTooltips[id]) {
          newTooltips[id] = {
            ...newTooltips[id],
            [type]: '',
          };
        }
        return newTooltips;
      });
    }, 3000);
  };

  // Modify the handleUpdateQuantity function:
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    const book = books.find((b) => b.id === id);
    if (!book) return;

    if (newQuantity < 1) {
      showTooltip(id, 'minus', 'Minimum quantity reached');
      return;
    }

    const quantityChange = book.available_quantity + 1;

    if (newQuantity > quantityChange) {
      showTooltip(id, 'plus', 'Maximum quantity reached');
      return;
    }

    updateQuantity(id, newQuantity);
  };

  const cancelRegister = () => {
    clearTransaction();
  };

  const handleLeavePointOfSaleRegister = async () => {
    if (currentOrder) {
      const { success, error } = await cancelPointOfSaleTransaction(
        currentOrder.id as string,
      );

      if (success) {
        clearTransaction();
        if (onExitClick) {
          onExitClick();
        }
      } else {
        console.error('Error cancelling transaction:', error);
        // Handle error (e.g., show an error message to the user)
      }
    } else {
      if (onExitClick) {
        onExitClick();
      }
    }
  };

  const handlePaymentSuccess = () => {
    // Handle successful payment (e.g., clear cart, show confirmation)
    closeFullScreenModal();
    // Additional logic for successful payment
  };

  const handlePaymentFailure = (error: string) => {
    // Handle payment failure (e.g., show error message)
    alert(error);
    // You might want to keep the modal open here to allow retrying
  };

  useEffect(() => {
    if (returningFromPayment) {
      handleOpenCalculateCheckoutModal();
      setReturningFromPayment(false);
    }
  }, [returningFromPayment]);

  const handleProceedToPayment = async (amount: number) => {
    if (!stripePromise) {
      console.error('Stripe Promise not initialized');
      return;
    }

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId: currentOrder?.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to create payment intent: ${errorText}`,
        };
      }

      const appearance: Appearance = {
        theme: 'stripe',
      };
  
      const options = {
        clientSecret: await response.json(),
        appearance: appearance,
        paymentMethodOrder: ['card']
      }

      openFullScreenModal(
        <Elements stripe={stripePromise} options={options}>
          <PointOfSaleRegisterPaymentProcessingModal
            currentOrder={currentOrder}
            cardHolderName={`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()}
            onPaymentFailure={handlePaymentFailure}
            onPaymentSuccess={handlePaymentSuccess}
            onReturnToRegister={closeFullScreenModal}
            totalAmount={amount}
          />
        </Elements>,
        'JRKC Bookstore',
        {
          centerHeaderContents: true,
          disableEscape: true,
          height: '800px',
          showCloseButton: false,
          showEscapeHint: false,
          width: '500px',
        },
      );
    } catch (error) {
      // Handle payment failure (e.g., show error message)
      alert(error);
      // You might want to keep the modal open here to allow retrying
    }
  };

  const handleOpenCalculateCheckoutModal = () => {
    const modalContent = (
      <PointOfSaleRegisterCheckoutModal
        currentOrder={currentOrder}
        orderItems={orderItems}
        books={books}
        getTotal={getTotal}
        onProceedToPayment={(amount) => {
          handleProceedToPayment(amount);
        }}
        onReturnToRegister={() => {
          closeFullScreenModal();
        }}
      />
    );

    openFullScreenModal(modalContent, 'JRKC Bookstore', {
      centerHeaderContents: true,
      disableEscape: true,
      height: '90%',
      showCloseButton: false,
      showEscapeHint: false,
      width: '500px',
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden transition-transform-background bg-content1 text-background box-border">
      {/* Left Sidebar - Utility Bar */}
      <div className="left-side-utility-bar h-full w-24 flex flex-col items-center py-2 px-1 ml-1">
        <Card className="h-full w-full flex flex-col shadow-large py-4 items-center bg-[#00BCD4] drop-shadow-xl">
          <div className="flex flex-col items-center w-full">
            <div className="w-20">
              <AppLogo />
            </div>
            <Divider className="my-4" />
            <Button isIconOnly className="bg-transparent">
              <FaStickyNote className="text-2xl text-yellow-600 drop-shadow-xl" />
            </Button>
          </div>

          <Divider className="my-4 mb-auto" />

          <div className="flex flex-col w-full mt-auto items-center">
            <Divider className="my-4" />
            <Button
              isIconOnly
              className="bg-transparent text-red-500 text-2xl drop-shadow-xl"
              color="danger"
              onClick={cancelRegister}
            >
              <FaTrash />
            </Button>

            <Divider className="my-4" />

            <Button
              isIconOnly
              onClick={handleLeavePointOfSaleRegister}
              className="text-2xl bg-transparent"
            >
              <FaCog className=" text-white drop-shadow-xl" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Search Bar */}
        <Card className="top-search-bar m-2 shadow-large p-2">
          <Input
            startContent={<FaSearch />}
            placeholder="Search books..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </Card>

        {/* Book Display Area */}
        <Card
          shadow="none"
          className="flex-1 m-2 overflow-y-auto shadow-lg drop-shadow-lg"
        >
          <div className="flex flex-wrap justify-start gap-4 p-4">
            {isInitialLoading
              ? Array(12)
                  .fill(0)
                  .map((_, index) => <BookCardSkeleton key={index} />)
              : books.map((book) => (
                  <Card
                    shadow="lg"
                    key={book.id}
                    className="relative p-2 border-transparent border hover:border-blue-400 cursor-pointer w-[150px] h-[220px] flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl"
                    onMouseDown={(e) => {
                      addToRegister(book, e);
                    }}
                  >
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      className="w-full h-24 object-cover mb-2 rounded-tl-lg rounded-tr-lg"
                    />
                    <h3 className="font-bold text-sm truncate">{book.title}</h3>
                    <div className="relative w-full flex mt-auto">
                      {book.is_promotion && book.discount_percentage && (
                        <span className="w-full flex justify-end">
                          <span className="text-xs bg-red-500 text-white rounded-md font-bold px-1 py-0">
                            ${book.discount_percentage}% OFF
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p
                        className={
                          book.is_promotion
                            ? 'line-through text-gray-500 drop-shadow-lg font-semibold'
                            : 'font-bold drop-shadow-lg'
                        }
                      >
                        ${book.retail_price.toFixed(2)}
                      </p>
                      {book.is_promotion && book.discount_percentage && (
                        <p className="text-red-500 font-bold">
                          $
                          {(
                            book.retail_price *
                            (1 - book.discount_percentage / 100)
                          ).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
            {isSearching && books.length === 0 && (
              <div className="w-full text-center py-4">Searching...</div>
            )}
            {!isSearching && !isInitialLoading && books.length === 0 && (
              <div className="w-full text-center py-4">No books found.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Collapsible Register Area */}
      {/* Right Register Area */}

      {isRegisterCollapsed ? (
        <div className="flex items-center fixed top-4 right-10 transition-all duration-300 ease-in-out">
          <Button
            isIconOnly
            className="z-50 bg-transparent text-primary-500 mr-4"
            onClick={() => setIsRegisterCollapsed(false)}
          >
            <FaBars className="text-2xl" />
          </Button>
          <Badge content={getItemCount()} color="primary">
            <FaCashRegister size={24} />
          </Badge>
        </div>
      ) : (
        <div className="collapsible-register-area w-full max-w-96 lg:max-w-[450px] pb-0 mb-0 flex flex-col">
          <Card className="my-2 mr-2 flex flex-col h-full" shadow="lg">
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center">
                {!isRegisterCollapsed && (
                  <Button
                    isIconOnly
                    className="mr-4 bg-transparent text-primary-500"
                    onClick={() => setIsRegisterCollapsed(true)}
                  >
                    <FaBars className="text-2xl" />
                  </Button>
                )}
                <Badge content={getItemCount()} color="primary">
                  <FaCashRegister size={24} />
                </Badge>
              </div>
            </div>
            <div className="register-items flex-1 overflow-y-auto p-4">
              {orderItems.length === 0 && (
                <Card className="mb-2 p-2 flex justify-center drop-shadow-lg">
                  <p className="text-center">No items in register</p>
                </Card>
              )}
              {orderItems.map((item) => {
                const book = books.find((b) => b.id === item.book_id);
                return (
                  <Card
                    key={item.id}
                    className="mb-2 p-2 flex flex-col flex-grow"
                    shadow="lg"
                  >
                    <div className="flex items-center">
                      {book && (
                        <img
                          src={book.thumbnail}
                          alt={book.title}
                          className="w-10 h-10 object-cover mr-2 rounded-md"
                        />
                      )}
                      <div className="flex-1 text-xs mr-1">
                        <p className="line-clamp-1">{book?.title}</p>
                        {book?.is_promotion && item.discount_percentage ? (
                          <p className="text-red-500">
                            ${(item.price ?? 0).toFixed(2)}
                          </p>
                        ) : (
                          <p>${(item.price_per_unit ?? 0).toFixed(2)}</p>
                        )}
                      </div>
                      <div className="flex items-center mr-1 h-6">
                        <Tooltip
                          color="warning"
                          content={tooltips[item.book_id]?.minus || ''}
                          isOpen={!!tooltips[item.book_id]?.minus}
                          placement="left-start"
                        >
                          <div
                            onClick={() =>
                              handleUpdateQuantity(
                                item.book_id,
                                item.quantity - 1,
                              )
                            }
                            className="flex items-center justify-center w-6 h-6 cursor-pointer text-blue-500 rounded-tl-lg rounded-bl-lg"
                          >
                            <FaMinus />
                          </div>
                        </Tooltip>
                        <input
                          disabled
                          value={item.quantity.toString()}
                          className="w-10 text-center"
                        />
                        <Tooltip
                          color="warning"
                          content={tooltips[item.book_id]?.plus || ''}
                          isOpen={!!tooltips[item.book_id]?.plus}
                          placement="left-start"
                        >
                          <div
                            onClick={() =>
                              handleUpdateQuantity(
                                item.book_id,
                                item.quantity + 1,
                              )
                            }
                            className="flex items-center justify-center w-6 h-6 cursor-pointer text-blue-500 rounded-tr-md rounded-br-lg"
                          >
                            <FaPlus />
                          </div>
                        </Tooltip>
                      </div>
                      <Button
                        isIconOnly
                        className="w-[2rem!important] h-[2rem!important] bg-transparent min-w-[2rem!important] min-h-[2rem!important] p-[0px!important"
                        color="danger"
                        onClick={() => removeFromRegister(item.id as string)}
                      >
                        <FaTrash className="text-red-500 text-lg" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
            <div className="p-4">
              <Card className="p-4 flex flex-col drop-shadow-lg">
                <div className="flex justify-between font-bold text-lg">
                  <span className="drop-shadow-lg">TOTAL: </span>
                  <span className="drop-shadow-lg">
                    ${getTotal().toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 drop-shadow-lg">
                  CREDIT CARD ONLY
                </p>
              </Card>
              <Button
                color="primary"
                className={`mt-4 w-full drop-shadow-xl text-lg ${getItemCount() == 0 ? 'bg-gray-400' : ''}`}
                onClick={handleOpenCalculateCheckoutModal}
              >
                Calculate Checkout
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PointOfSaleRegister;
