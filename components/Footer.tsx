'use client';

import AppLogo from "@/components/AppLogo";

// components/Footer.tsx

import * as packageInfo from "../package.json";
import { Link } from "@heroui/react";

export default function Footer() {
  const authors = packageInfo?.authors || [];
  const projectContext = packageInfo?.projectContext || '';
  const repositoryUrl = packageInfo?.repositoryUrl || '';
  const version = packageInfo?.version || "";

  return (
    <footer className="flex w-full flex-col items-center gap-4 border-t border-gray-300 p-8 text-center dark:border-gray-600">
      {projectContext ? (
        <p className="max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          {projectContext}
        </p>
      ) : null}
      <p className="font-semibold">Created collaboratively by</p>
      <ul className="flex flex-col justify-center sm:flex-row">
        {authors.map((author) => (
          <li
            key={author.name}
            className="border-gray-300 dark:border-gray-600 sm:[&:not(:first-child)]:ml-4 sm:[&:not(:last-child)]:border-r"
          >
            <span className="mr-2 whitespace-nowrap font-bold sm:mr-4">
              {author.name}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs sm:text-sm">
        &copy; {new Date().getFullYear()} JRKC Bookstore.
      </p>
      <div className="mt-2 flex items-center justify-center gap-2">
        <AppLogo width={80} height={24} />
        <Link
          className="cursor-pointer"
          href={repositoryUrl}
          rel="noreferrer"
          target="_blank"
        >
          {version ? (
            <span className="flex items-end">
              View source&nbsp;v<span className="text-lg">{version}</span>
            </span>
          ) : (
            'View source'
          )}
        </Link>
      </div>
    </footer>
  );
}
