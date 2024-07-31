// app/not-found.tsx

"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="404-page-wrapper container flex flex-col flex-grow justify-center items-center px-4 mx-auto">
      <div className="max-w-md w-full">
        <Card className="p-4 sm:p-6 md:p-8" shadow="lg">
          <CardHeader className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-2">404</h1>
            <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold mb-6 text-center">OOPS!</p>
            <p className="mb-6 text-center">
              It seems this page has been lost between the shelves. Let us get
              you back to our main collection.
            </p>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-24 bg-blue-500 rounded transform -rotate-6 mr-2"></div>
              <div className="w-16 h-24 bg-green-500 rounded transform rotate-6 mr-2"></div>
              <div className="w-16 h-24 bg-red-500 rounded transform -rotate-3"></div>
            </div>
            <Link
              href="/"
              className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Return to Homepage
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
