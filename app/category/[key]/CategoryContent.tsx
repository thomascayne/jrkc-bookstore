// app/category/[key]/CategoryContent.tsx

"use client";

import { BiArrowToTop, BiCaretDown } from "react-icons/bi";
import { Button } from "@nextui-org/react";
import { fetchBookDetails } from "@/utils/bookApi";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import StarRating from "@/components/StarRating";
import { fetchBookFromSupabase } from "@/utils/bookFromSupabaseApi";
import { GoogleBook } from "@/interfaces/GoogleBook";
import { IBook } from "@/interfaces/IBook";
import { fetchBooksByCategory } from "@/utils/fetchBooksByCategory ";
import EmptyBookshelf from "@/components/EmptyBookshelf";
import { useStore } from "@tanstack/react-store";
import { addItem, cartStore } from "@/stores/cartStore";
import { useFullScreenModal } from "@/contexts/FullScreenModalContext";
import BookDetails from "@/components/BookDetails";
import CategoryLoadingSkeleton from "@/components/CategoryLoadingSkeleton";

export default function CategoryContent({
  params,
}: {
  params: { key: string };
}) {
  const searchParams = useSearchParams();

  const [bookDetails, setBookDetails] = useState<GoogleBook>();
  const [books, setBooks] = useState<IBook[]>([]);
  const [bookTitle, setBookTitle] = useState("");
  const [category, setCategory] = useState("");
  const [displayedBooks, setDisplayedBooks] = useState<IBook[]>([]);
  const [fetchedBooks, setFetchedBooks] = useState<IBook[]>([]);
  const [imageLink, setImageLink] = useState("");
  const [imageSize, setImageSize] = useState("thumbnail");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<IBook>();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isLarge = useMediaQuery("(min-width: 1025px)");
  const isMedium = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
  const isSmall = useMediaQuery("(max-width: 640px)");

  const { openModal } = useFullScreenModal();

  const booksPerLoad = 10;
  const label = searchParams.get("label") as string;

  useEffect(() => {
    setIsLoading(true);

    const fetchBooks = async () => {
      try {
        const { category, fetchedBooks, books, displayedBooks } =
          await fetchBooksByCategory(params.key, booksPerLoad);

        setCategory(category);
        setFetchedBooks(fetchedBooks);
        setBooks(books);
        setDisplayedBooks(displayedBooks);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching books:", error);
        setIsLoading(false);
      }
    };

    fetchBooks();

    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [label, params.key, booksPerLoad]);

  const loadMoreBooks = () => {
    const currentLength = displayedBooks.length;
    const newBooks = books.slice(currentLength, currentLength + booksPerLoad);
    setDisplayedBooks([...displayedBooks, ...newBooks]);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleBookClick = async (book: IBook) => {
    try {
      // fetch book details from supabase
      const supabaseBook = await fetchBookFromSupabase<IBook>(book.id);

      // fetch additional book details from Google Books API
      const thisBookDetails = await fetchBookDetails<GoogleBook>(book.id);

      const bookDetails = {
        ...supabaseBook,
        ...thisBookDetails,
      };

      setBookDetails(bookDetails);
      setSelectedBook(book);
      setBookTitle(`${category} - ${thisBookDetails.volumeInfo.title}`);

      if (isSmall && thisBookDetails.volumeInfo.imageLinks?.small) {
        setImageSize("small");
        setImageLink(thisBookDetails.volumeInfo.imageLinks.small);
      } else if (isMedium && thisBookDetails.volumeInfo.imageLinks?.medium) {
        setImageSize("medium");
        setImageLink(thisBookDetails.volumeInfo.imageLinks.medium);
      } else if (isLarge && thisBookDetails.volumeInfo.imageLinks?.large) {
        setImageSize("large");
        setImageLink(thisBookDetails.volumeInfo.imageLinks.large);
      }

      openModal(
        <BookDetails
          bookDetails={bookDetails}
          selectedBook={book}
          imageLink={imageLink}
        />,
        bookTitle
      );
    } catch (error) {
      console.error("Error fetching book details:", error);
    }
  };

  const handleAddToCart = (book: IBook) => {
    addItem(book);
  };

  return (
    <section className="CategoryContent-container h-full flex flex-col flex-grow overflow-hidden">
      <div className="CategoryContent container mx-auto px-4 pb-4 my-8 relative flex-grow">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-3xl font-bold mb-4 pt-4">{category}</h1>
        </div>

        {isLoading ? (
          <CategoryLoadingSkeleton />
        ) : books.length === 0 ? (
          <EmptyBookshelf
            message={`${
              category
                ? "We are working on adding books to the ${category} category. In the meantime, why not explore our other categories?"
                : "While you are here, why not explore our other categories?"
            }`}
            subtitle={`${
              category
                ? "We are still stocking this shelf"
                : "Maybe you came to the wrong place"
            } `}
            title={`No Books in ${category ? category : "this category"}`}
          />
        ) : (
          <div className="masonry-grid m-auto columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-8 gap-4 w-full">
            {displayedBooks.map((book) => (
              <div
                key={book.id}
                className="relative group overflow-hidden shadow-sm mb-4 flex transition-all ease-in-out duration-400 flex-col items-center justify-center border p-4 rounded hover:border-blue-500 break-inside-avoid"
              >
                <div className="absolute flex items-center gap-3"></div>
                <div
                  className="w-full flex flex-col items-center cursor-pointer pt-1 hover:bg-gray-100"
                  onClick={() => handleBookClick(book)}
                >
                  {book.is_promotion && book.discount_percentage && (
                    <div className="absolute top-0 left-[0] bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br z-10">
                      {`${book.discount_percentage}% OFF`}
                    </div>
                  )}

                  <div className="relative w-32 h-48 mb-2">
                    {book.thumbnail_image_link && (
                      <Image
                        alt={book.title}
                        className="mb-2"
                        fill
                        src={book.thumbnail_image_link}
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <h2 className="font-bold book-name whitespace-normal">
                    {book.title}
                  </h2>
                </div>
                <p className="book-authors">{book.authors.substring(0, 20)}</p>
                {book.average_rating && (
                  <div className="flex mt-2">
                    <StarRating rating={book.average_rating} />
                    <span className="mt-[-3px] ml-2 text-lg">
                      {book.average_rating}
                    </span>
                  </div>
                )}
                {book.list_price && (
                  <div className="flex mt-2 book-price">
                    <span className="mt-[-2px] ml-2 text-lg">
                      $ {book.list_price}
                    </span>
                  </div>
                )}
                <div
                  className="absolute cursor-pointer bottom-0 left-0 right-0 bg-blue-500 text-white text-center py-2 transform translate-y-full transition-transform duration-500 ease-in-out group-hover:translate-y-0"
                  onClick={() => handleAddToCart(book)}
                >
                  QUICK ADD
                </div>
              </div>
            ))}
          </div>
        )}
        {/* ... load more books button and back to top button */}
        {displayedBooks.length < books.length && (
          <div className="flex justify-center my-8">
            <Button onClick={loadMoreBooks} className="mx-2 flex items-center">
              <span>More </span> <BiCaretDown className="ml-2" />
            </Button>
          </div>
        )}
        {displayedBooks.length === books.length &&
          !isLoading &&
          books.length > 0 && (
            <div className="flex justify-center my-8">
              <Button
                radius="none"
                onClick={scrollToTop}
                className="px-2 flex items-center"
              >
                <span>Back to top </span> <BiArrowToTop className="ml-2" />
              </Button>
            </div>
          )}
      </div>
    </section>
  );
}
