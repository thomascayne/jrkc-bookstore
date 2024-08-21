// components/BookImage.tsx

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import BookCoverPlaceholder from "./BookCoverPlaceholder";
import { GoogleBook } from "@/interfaces/GoogleBook";
import BookDetailsSkeleton from "@/components/BookDetailsSkeleton";
import { IBookInventory } from "@/interfaces/IBookInventory";

interface BookImageProps {
  googleBook?: GoogleBook;
  size?: string;
  supabaseBook?: IBookInventory;
  useLargeImage?: boolean;
}

const BookImage: React.FC<BookImageProps> = ({
  googleBook,
  size = "w-32 h-48",
  supabaseBook,
  useLargeImage = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      setLoaded(true);
      setTimeout(() => setFadeIn(true), 50);
    }
  }, [imageRef]);

  useEffect(() => {
    let newImageUrl: string | undefined;

    if (useLargeImage && googleBook) {
      newImageUrl =
        googleBook.volumeInfo.imageLinks?.extraLarge ||
        googleBook.volumeInfo.imageLinks?.large ||
        googleBook.volumeInfo.imageLinks?.medium ||
        googleBook.volumeInfo.imageLinks?.small ||
        googleBook.volumeInfo.imageLinks?.thumbnail;
    } else {
      newImageUrl = supabaseBook?.thumbnail_image_link;
    }

    setImageUrl(newImageUrl);
    setImageError(false);
    setLoaded(false);
    setFadeIn(false);
  }, [googleBook, useLargeImage, supabaseBook]);

  const containerClass = `book-cover-container relative w-full aspect-[3/4] ${
    useLargeImage ? "w-2/3" : size
  } mt-0 mb-4 mx-auto transition-all duration-250 ease-in-out`;

  const loadingImageComplete = () => {
    setLoaded(true);
    setTimeout(() => setFadeIn(true), 50);
  };

  return (
    <div className={containerClass}>
      <div
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          fadeIn ? "opacity-0" : "opacity-100"
        }`}
      >
        <BookDetailsSkeleton />
      </div>
      {!imageUrl && (
        <BookCoverPlaceholder
          title={supabaseBook?.title ?? "Unknown Title"}
          author={supabaseBook?.authors ?? "Unknown Author"}
          size={size}
        />
      )}
      {imageUrl && (
        <div
          ref={imageRef}
          className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            alt={supabaseBook?.title ?? "Book Cover"}
            fill
            sizes={useLargeImage ? "(max-width: 768px) 100vw, 50vw" : "33vw"}
            src={imageUrl}
            style={{ objectFit: "contain" }}
            onLoad={loadingImageComplete}
            onLoadingComplete={loadingImageComplete}
            onError={() => setImageError(true)}
          />
        </div>
      )}
      {imageError && (
        <BookCoverPlaceholder
          title={supabaseBook?.title ?? "Unknown Title"}
          author={supabaseBook?.authors ?? "Unknown Author"}
          size={size}
        />
      )}
    </div>
  );
};

export default BookImage;
