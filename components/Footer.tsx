import AppLogo from "@/components/AppLogo";

// components/Footer.tsx

import * as packageInfo from "../package.json";
import { Link } from "@nextui-org/react";

export default function Footer() {
  const authors = packageInfo?.authors || [];

  return (
    <footer className="w-full border-t  border-gray-300 dark:border-gray-600 p-8 gap-2 flex flex-col justify-center text-center">
      <p>&mdash; Powered by &mdash;</p>
      <ul className="flex justify-center flex-col sm:flex-row ">
        {authors.map((author) => (
          <li
            key={author.name}
            className="sm:[&:not(:last-child)]:border-r sm:[&:not(:first-child)]:ml-4 border-gray-300 dark:border-gray-600"
          >
            <span className="font-bold mr-2 sm:mr-4 whitespace-nowrap">
              {author.name}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs sm:text-sm">
        &copy; {new Date().getFullYear()} JRKC Bookstore.
      </p>
      <div className="mt-2 flex justify-center gap-4">
        <AppLogo width={80} height={24} />
        <Link
          href="https://github.com/thomascayne/jrkc-bookstore"
          target="_blank"
        >
          <span>v</span>{" "}
          <span className="text-lg">{process.env.APP_VERSION}</span>
        </Link>
      </div>
    </footer>
  );
}
