// app/update-password/UpdatePasswordForm.tsx
"use client";

import { apiRequest } from "@/utils/apiClient";
import { SubmitButton } from "@/components/submit-button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdatePassword = async (formData: FormData) => {
    const password = formData.get("password") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setMessage("Error: Passwords do not match");
      return;
    }

    try {
      await apiRequest("/api/account", {
        body: JSON.stringify({ currentPassword, newPassword: password }),
        method: "PATCH",
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unable to update password."}`,
      );
    }
  };

  return (
    <form className="flex flex-col gap-4">
      {message && (
        <div
          className={`p-4 rounded ${
            message.startsWith("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
          Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="w-full rounded-md px-4 py-2 bg-inherit border"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          New Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md px-4 py-2 bg-inherit border"
          required
        />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium mb-1"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-md px-4 py-2 bg-inherit border"
          required
        />
      </div>
      <SubmitButton
        formAction={handleUpdatePassword}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        pendingText="Updating Password..."
      >
        Update Password
      </SubmitButton>
    </form>
  );
}
