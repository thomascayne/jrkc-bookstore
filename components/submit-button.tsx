// app/components/submit-button.tsx
"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";

export function SubmitButton({
  children,
  className,
  formAction,
  isDisabled,
  pendingText,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  formAction: (formData: FormData) => Promise<void>;
  isDisabled?: boolean;
  pendingText: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "formAction">) {
  const { pending } = useFormStatus();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(pending);
  }, [pending]);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsPending(true);
    const form = event.currentTarget.closest("form");
    if (form) {
      const formData = new FormData(form);
      await formAction(formData);
    }
    setIsPending(false);
  };

  return (
    <button
      className={`${
        isDisabled ? "cursor-not-allowed bg-blue-200" : ""
      } ${className} ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={isPending || isDisabled}
      onClick={handleClick}
      {...props}
    >
      {isPending ? pendingText : children}
    </button>
  );
}
