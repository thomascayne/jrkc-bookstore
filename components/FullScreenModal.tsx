// components/FullScreenModal.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { IoMdClose } from "react-icons/io";
import AppLogo from "@/components/AppLogo";
import { waitSomeTime } from "@/utils/wait-some-time";

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
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      (async () => {
        await waitSomeTime(300);
        setIsRendered(false);
      })();
    }
  }, [isOpen]);

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
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-transform duration-500 ease-in-out transform ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
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
