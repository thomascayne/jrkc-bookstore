// components/FullScreenModal.tsx

"use client";

import React, { useEffect } from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { IoMdClose } from "react-icons/io";
import AppLogo from "@/components/AppLogo";

interface FullScreenModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  children,
  isOpen,
  onClose,
  title,
}) => {
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <Card className="w-full h-full" shadow="lg" radius="none">
        <CardHeader className="">
          <div className="flex flex-row w-full justify-between items-center">
            <AppLogo />
            <h2 className="text-xl font-bold hidden md:flex">{title}</h2>
            <button
              onClick={onClose}
              className="flex text-2xl hover:text-red-600 transition-colors"
            >
              <IoMdClose />
            </button>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col items-center overflow-auto [&::-webkit-scrollbar]:hidden">
          {children}
        </CardBody>
      </Card>
    </div>
  );
};

export default FullScreenModal;
