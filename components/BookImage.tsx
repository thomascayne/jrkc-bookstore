// components/BookImage.tsx

import React, { useState, useEffect } from "react";
import Image from "next/image";
import BookCoverPlaceholder from "./BookCoverPlaceholder";
import BookDetailsSkeleton from "@/components/BookDetailsSkeleton";
import { IBookInventory } from "@/interfaces/IBookInventory";

interface BookImageProps {
  size?: string;
  inventoryBook?: IBookInventory;
  useLargeImage?: boolean;
}

const BookImage: React.FC<BookImageProps> = ({
  size = "w-32 h-48",
  inventoryBook,
  useLargeImage = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const newImageUrl =
      inventoryBook?.thumbnail_image_link ||
      inventoryBook?.small_thumbnail_image_link ||
      undefined;

    setImageUrl(newImageUrl);
    setImageError(false);
    setLoaded(false);
  }, [inventoryBook]);

  const containerClass = `book-cover-container relative w-full aspect-[3/4] ${
    useLargeImage ? "w-2/3" : size
  } mt-0 mb-4 mx-auto transition-all duration-250 ease-in-out`;

  const loadingImageComplete = () => {
    setLoaded(true);
  };

  const showPlaceholder = !imageUrl || imageError;

  return (
    <div className={containerClass}>
      {imageUrl && !loaded && !imageError && (
        <div className="absolute inset-0">
          <BookDetailsSkeleton />
        </div>
      )}
      {showPlaceholder && (
        <BookCoverPlaceholder
          title={inventoryBook?.title ?? "Unknown Title"}
          author={inventoryBook?.authors ?? "Unknown Author"}
          size="h-full w-full"
        />
      )}
      {imageUrl && !imageError && (
        <div className={`absolute inset-0 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}>
          <Image
            alt={inventoryBook?.title ?? "Book Cover"}
            fill
            sizes={useLargeImage ? "(max-width: 768px) 100vw, 50vw" : "33vw"}
            src={imageUrl}
            style={{ objectFit: "contain" }}
            onLoad={loadingImageComplete}
            onError={() => setImageError(true)}
          />
        </div>
      )}
    </div>
  );
};

export default BookImage;
