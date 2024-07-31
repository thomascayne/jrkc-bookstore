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

export default function CategoryContent({
  params,
}: {
  params: { key: string };
}) {
  const searchParams = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  const [fetchedBooks, setFetchedBooks] = useState<Book[]>([]);
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const booksPerLoad = 10;
  const label = searchParams.get("label") as string;

  useEffect(() => {
    setIsLoading(true);

    const fetchBooks = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
      const apiUrl = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_URL;

      try {
        const response = await fetch(
          `${apiUrl}?q=subject:${encodeURIComponent(
            (label as string) || params.key
          )}&orderBy=relevance&maxResults=40&filter=paid-ebooks&printType=books&projection=full&key=${apiKey}`
        );

        const word: string = label
          ? label.charAt(0).toUpperCase() + label.slice(1)
          : params.key
          ? params.key.charAt(0).toUpperCase() + params.key.slice(1)
          : "";

        setCategory(word);

        console.log("label || params.key:", label, params.key);

        const data = await response.json();
        const fetchedItems = data.items || [];

        const booksWithImages = fetchedItems.filter(
          (book: Book) =>
            book.volumeInfo &&
            book.volumeInfo.imageLinks &&
            book.volumeInfo.imageLinks.thumbnail &&
            book.saleInfo?.listPrice?.amount
        );

        setFetchedBooks(booksWithImages);
        setBooks(booksWithImages);
        setDisplayedBooks(booksWithImages.slice(0, booksPerLoad));
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

  const handleBookClick = async (book: Book) => {
    const thisBookDetails = await fetchBookDetails(book.id);

    setBookDetails(thisBookDetails);
    console.log("thisBookDetails:", thisBookDetails);

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
            {<h2 className="text-xl font-bold flex md:hidden">{bookTitle}</h2>}
            {bookDetails?.volumeInfo.subtitle && (
              <h3 className="text-xl mb-2">
                {bookDetails?.volumeInfo.subtitle}
              </h3>
            )}
            {imageLink && (
              <BookImage
                imageUrl={imageLink}
                title={bookDetails!.volumeInfo.title}
              />
            )}
            <p className="mb-2">
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
            <h1 className="text-3xl font-bold mb-4 pt-4">
              {label ||
                params.key.charAt(0).toUpperCase() + params.key.substring(1)}
            </h1>
          </div>
          <div className="masonry-grid m-auto columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-8 gap-4 w-full">
            {isLoading
              ? Array.from({ length: 8 }).map((_, index) => (
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
                ))
              : displayedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="relative group overflow-hidden shadow-sm mb-4 flex transition-all ease-in-out duration-150 flex-col items-center justify-center border p-4 rounded hover:border-blue-500 break-inside-avoid"
                  >
                    <div
                      className="w-full flex flex-col items-center cursor-pointer pt-1 hover:bg-gray-100"
                      onClick={() => handleBookClick(book)}
                    >
                      <div className="relative w-32 h-48 mb-2">
                        {book.volumeInfo.imageLinks?.thumbnail && (
                          <Image
                            alt={book.volumeInfo.title}
                            className="mb-2"
                            fill
                            src={book.volumeInfo.imageLinks.thumbnail}
                            style={{ objectFit: "cover" }}
                          />
                        )}
                      </div>
                      <h2 className="font-bold book-name whitespace-normal">
                        {book.volumeInfo.title}
                      </h2>
                    </div>
                    <p className="book-authors">
                      {book.volumeInfo.authors?.join(", ").substring(0, 20)}
                    </p>
                    {book.volumeInfo.averageRating && (
                      <div className="flex mt-2">
                        <StarRating rating={book.volumeInfo.averageRating} />
                        <span className="mt-[-3px] ml-2 text-lg">
                          {book.volumeInfo.averageRating}
                        </span>
                      </div>
                    )}
                    {book.saleInfo?.retailPrice?.amount && (
                      <div className="flex mt-2 book-price">
                        <span className="mt-[-2px] ml-2 text-lg">
                          $ {book.saleInfo?.retailPrice?.amount}
                        </span>
                      </div>
                    )}
                    <div
                      className="absolute cursor-pointer bottom-0 left-0 right-0 bg-blue-500 text-white text-center py-2 transform translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(
                          `Quick Add clicked for book: ${book.volumeInfo.title}`
                        );
                      }}
                    >
                      QUICK ADD
                    </div>
                  </div>
                ))}
          </div>
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
          {displayedBooks.length === books.length && (
            <div className="flex justify-center my-8">
              <Button onClick={scrollToTop} className="mx-2 flex items-center">
                <span>Back to top </span> <BiArrowToTop className="ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
