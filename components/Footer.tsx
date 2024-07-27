import AppLogo from "@/components/AppLogo";

// components/Footer.tsx

import * as packageInfo from "../package.json";

export default function Footer() {
  const authors = packageInfo?.authors || [];

  return (
    <footer className="w-full border-t border-t-foreground/10 p-8 gap-2 flex flex-col justify-center text-center">
      <p>&mdash; Powered by &mdash;</p>
      <ul className="flex justify-center flex-col sm:flex-row ">
        {authors.map((author) => (
          <li
            key={author.name}
            className="sm:[&:not(:last-child)]:border-r sm:[&:not(:first-child)]:ml-4 border-gray-400"
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
      <div className="mt-2 flex justify-center">
        <AppLogo width={80} height={24} />
      </div>
    </footer>
  );
}
