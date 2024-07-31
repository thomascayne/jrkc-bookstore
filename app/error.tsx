// app/error.tsx

"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // if there's an error, log it to the console or implement your own error logging solution
    console.error(error);
  }, [error]);

  return (
    <div className="500-page-wrapper container flex flex-col flex-grow justify-center items-center px-4 mx-auto">
      <div className="max-w-md w-full">
        <Card className="p-4 sm:p-6 md:p-8" shadow="lg">
          <CardHeader className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-2">500</h1>
            <h2 className="text-2xl font-semibold mb-4">Server Error</h2>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold mb-6 text-center">OOPS!</p>
            <p className="mb-6 text-center">
              Something went wrong on our end. Our librarians are working hard
              to fix it.
            </p>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-24 bg-red-500 rounded transform -rotate-6 mr-2"></div>
              <div className="w-16 h-24 bg-yellow-500 rounded transform rotate-6 mr-2"></div>
              <div className="w-16 h-24 bg-orange-500 rounded transform -rotate-3"></div>
            </div>
            <div className="flex flex-col space-y-4">
              <button
                onClick={reset}
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="block w-full text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Return to Homepage
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
