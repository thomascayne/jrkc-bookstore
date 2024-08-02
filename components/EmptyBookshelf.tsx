// components/EmptyBookshelf.tsx

import React from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import Link from "next/link";

interface Book {
  color: string;
  title: string;
}

interface EmptyBookshelfProps {
  title?: string;
  subtitle?: string;
  message?: string;
  books?: Book[];
  linkText?: string;
  linkHref?: string;
}

const defaultBooks: Book[] = [
  { color: "bg-blue-500", title: "Novel" },
  { color: "bg-green-500", title: "Poetry" },
  { color: "bg-red-500", title: "History" },
  { color: "bg-yellow-500", title: "Science" },
  { color: "bg-purple-500", title: "Art" },
  { color: "bg-pink-500", title: "Romance" },
  { color: "bg-indigo-500", title: "Mystery" },
  { color: "bg-teal-500", title: "Fantasy" },
];

const EmptyBookshelf: React.FC<EmptyBookshelfProps> = ({
  title = "No Books Found",
  subtitle = "This shelf is empty",
  message = "It seems we don't have any books in this category yet. Check back later or explore our other collections.",
  books = defaultBooks,
  linkText = "",
  linkHref = "",
}) => {
  return (
    <Card className="p-4 sm:p-6 md:p-8 mt-10 md:w-[560px]" shadow="lg">
      <CardHeader className="flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4 text-center">{title}</h2>
        <h2 className="text-2xl font-semibold mb-4">{subtitle}</h2>
      </CardHeader>
      <CardBody>
        <p className="mb-6 text-center">{message}</p>
        <div className="flex justify-center mb-1 perspective-500">
          {books.map((book, index) => (
            <div
              key={index}
              className={`w-8 h-32 ${
                book.color
              } rounded-sm transform rotate-y-${index * 5} translate-z-${
                index * 2
              } shadow-md flex items-center justify-center`}
            >
              <span className="text-xs font-bold writing-mode-vertical-rl rotate-180">
                {book.title}
              </span>
            </div>
          ))}
        </div>
        <Link
          href={linkHref ? linkHref : "#"}
          className="block w-full h-10 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          {linkText ? linkText : ""}
        </Link>
      </CardBody>
    </Card>
  );
};

export default EmptyBookshelf;
