// components/BookImage.tsx

import React, { useState } from "react";
import Image from "next/image";
import BookDetailsSkeleton from "@/components/BookDetailsSkeleton";

interface BookImageProps {
  imageUrl: string;
  title: string;
  size?: string;
}

const BookImage: React.FC<BookImageProps> = ({
  imageUrl,
  title,
  size = "max-w-[600px]",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`book-cover-container relative w-full aspect-[3/4] ${size} mt-0 mb-4 mx-auto transition-all duration-250 ease-in-out 
      }`}
    >
      {!isLoaded ? <BookDetailsSkeleton /> : null}
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="(max-width: 600px) 100vw, 600px"
        style={{ objectFit: "contain" }}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default BookImage;
