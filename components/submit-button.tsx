// app/components/submit-button.tsx
"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";

export function SubmitButton({
  children,
  pendingText,
  className,
  formAction,
  ...props
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
  formAction: (formData: FormData) => Promise<void>;
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
      className={`${className} ${
        isPending ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={isPending}
      onClick={handleClick}
      {...props}
    >
      {isPending ? pendingText : children}
    </button>
  );
}
