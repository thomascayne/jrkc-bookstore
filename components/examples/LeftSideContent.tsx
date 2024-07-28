// app/components/LeftSideContent.tsx
"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import Image from "next/image";

export default function LeftSideContent() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Book Details</h2>
      <Image
        src="https://via.placeholder.com/150"
        alt="Book Cover"
        width={150}
        height={150}
        className="mb-4"
      />
      <h3 className="text-xl font-semibold mb-2">Sample Book Title</h3>
      <p className="mb-2">
        <strong>Author:</strong> John Doe
      </p>
      <p className="mb-2">
        <strong>Published:</strong> 2023
      </p>
      <p className="mb-4">
        <strong>Description:</strong> This is a sample book description. It
        would contain information about the plot, characters, and other relevant
        details about the book.
      </p>
      <Button color="primary">Add to Cart</Button>
    </div>
  );
}
