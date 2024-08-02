// app/category/[key]/CategoryContent.tsx

"use client";

import { BiArrowToTop, BiCaretDown } from "react-icons/bi";
import { Book } from "@/interfaces/Book";
import { Button } from "@nextui-org/react";
import { fetchBookDetails } from "@/utils/bookApi";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSearchParams } from "next/navigation";
import BookImage from "@/components/BookImage";
import Image from "next/image";
import SafeHTML from "@/components/SafeHTML";
import StarRating from "@/components/StarRating";
import FullScreenModal from "@/components/FullScreenModal";
import { fetchBookFromSupabase } from "@/utils/bookFromSupabaseApi";
import { GoogleBook } from "@/interfaces/GoogleBook";
import { IBook } from "@/interfaces/IBook";
import { fetchBooksByCategory } from "@/utils/fetchBooksByCategory ";
import EmptyBookshelf from "@/components/EmptyBookshelf";

export default function CategoryContent({
  params,
}: {
  params: { key: string };
}) {
  const searchParams = useSearchParams();

  const [books, setBooks] = useState<IBook[]>([]);
  const [displayedBooks, setDisplayedBooks] = useState<IBook[]>([]);
  const [fetchedBooks, setFetchedBooks] = useState<IBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isLarge = useMediaQuery("(min-width: 1025px)");
  const isMedium = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
  const isSmall = useMediaQuery("(max-width: 640px)");
  const [bookDetails, setBookDetails] = useState<Book>();
  const [imageSize, setImageSize] = useState("thumbnail");
  const [imageLink, setImageLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isPromotionBadge, setIsPromotionBadge] = useState(false);
  const [selectedBook, setSelectedBook] = useState<IBook>();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const booksPerLoad = 10;
  const label = searchParams.get("label") as string;

  useEffect(() => {
    setIsLoading(true);

    const fetchBooks = async () => {
      try {
        const { category, fetchedBooks, books, displayedBooks } =
          await fetchBooksByCategory(params.key, booksPerLoad);

        console.log("category:", category);
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

      openModal();
    } catch (error) {
      console.error("Error fetching book details:", error);
    }
  };

  return (
    <section>
      <FullScreenModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={bookTitle}
      >
        <div className="container space-y-4 w-full px-4 sm:px-0 sm:w-[480px] lg:w-[640px]">
          <div>
            {
              <h2 className="text-xl font-bold flex md:hidden mb-4">
                {bookTitle}
              </h2>
            }
            {bookDetails?.volumeInfo.subtitle && (
              <h3 className="text-xl mb-2">
                {bookDetails?.volumeInfo.subtitle}
              </h3>
            )}
            {imageLink && (
              <div className="relative shadow-large border bg-transparent pt-4 rounded-sm border-gray-300 dark:border-gray-600">
                {selectedBook?.is_promotion &&
                  selectedBook.discount_percentage && (
                    <div className="absolute top-0 left-[0] bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br z-10">
                      {`${selectedBook.discount_percentage}% OFF`}
                    </div>
                  )}

                <BookImage
                  imageUrl={imageLink}
                  title={bookDetails!.volumeInfo.title}
                />
              </div>
            )}
            <p className="mb-2 mt-6">
              <strong>Author(s):</strong>{" "}
              {bookDetails?.volumeInfo.authors?.join(", ")}
            </p>
            <p className="mb-2">
              <strong>Published:</strong>{" "}
              {bookDetails?.volumeInfo.publishedDate} by{" "}
              {bookDetails?.volumeInfo.publisher}
            </p>
            <p className="mb-2">
              <strong>Pages:</strong> {bookDetails?.volumeInfo.pageCount}
            </p>
            <div className="mb-4 flex flex-col gap-2">
              <strong>Description:</strong>
              <SafeHTML html={bookDetails?.volumeInfo.description || ""} />
            </div>
            {bookDetails?.volumeInfo.categories && (
              <p className="mb-2">
                <strong>Categories:</strong>{" "}
                {bookDetails?.volumeInfo.categories.join(", ")}
              </p>
            )}
            {bookDetails?.volumeInfo.averageRating && (
              <div className="flex gap-2 items-center">
                <strong>Rating:</strong>
                <StarRating rating={bookDetails.volumeInfo.averageRating} />
                <span>({bookDetails.volumeInfo.ratingsCount} ratings)</span>
              </div>
            )}
          </div>
        </div>
      </FullScreenModal>

      <div className="CategoryContent-container h-full flex flex-col flex-grow">
        <div className="CategoryContent container mx-auto px-4 pb-4 my-8 relative flex-grow">
          <div className="flex flex-col items-center mb-4">
            <h1 className="text-3xl font-bold mb-4 pt-4">{category}</h1>
          </div>

          {isLoading ? (
            <div className="masonry-grid m-auto columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-8 gap-4 w-full">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="mask-placeholder shadow-sm mb-4 flex transition-all ease-in-out duration-150 flex-col items-center justify-center border p-4 rounded cursor-pointer hover:border-blue-500 break-inside-avoid bg-gray-200 animate-pulse w-full min-w-[120px]"
                >
                  <div
                    className="w-full bg-gray-300 mb-2 min-h-[160px]"
                    style={{ aspectRatio: "3/4" }}
                  ></div>
                  <div
                    className="w-full bg-gray-300 mb-2 min-w-[100px]"
                    style={{ height: "20px" }}
                  ></div>
                  <div
                    className="w-2/3 bg-gray-300 min-w-[80px]"
                    style={{ height: "16px" }}
                  ></div>
                </div>
              ))}
            </div>
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
                  <p className="book-authors">
                    {book.authors.substring(0, 20)}
                  </p>
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
                    className="absolute cursor-pointer bottom-0 left-0 right-0 bg-blue-500 text-white text-center py-2 transform translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Quick Add clicked for book: ${book.title}`);
                    }}
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
              <Button
                onClick={loadMoreBooks}
                className="mx-2 flex items-center"
              >
                <span>More </span> <BiCaretDown className="ml-2" />
              </Button>
            </div>
          )}
          {displayedBooks.length === books.length &&
            !isLoading &&
            books.length > 0 && (
              <div className="flex justify-center my-8">
                <Button
                  onClick={scrollToTop}
                  className="mx-2 flex items-center"
                >
                  <span>Back to top </span> <BiArrowToTop className="ml-2" />
                </Button>
              </div>
            )}
        </div>
      </div>
    </section>
  );
}
