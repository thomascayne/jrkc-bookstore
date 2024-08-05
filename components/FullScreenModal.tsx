// components/FullScreenModal.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Divider, Button } from "@nextui-org/react";
import { IoMdClose } from "react-icons/io";
import AppLogo from "@/components/AppLogo";
import { waitSomeTime } from "@/utils/wait-some-time";
import FullScreenOverlay from "@/components/FullScreenOverlay";
import { disableBodyScroll, enableBodyScroll } from "@/utils/bodyScroll.ts";

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
      disableBodyScroll();
    } else {
      (async () => {
        await waitSomeTime(300);
        setIsRendered(false);
        enableBodyScroll();
      })();
    }

    // ensure scroll is re-enabled when component unmounts
    return () => {
      enableBodyScroll();
    };
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
      className={`fixed inset-0 z-[1000] top-0 right-0 bottom-0 left-0 flex items-center justify-center overflow-hidden transition-transform duration-500 ease-in-out transform ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <FullScreenOverlay />
      <Card
        className="max-w-[90%] w-[90%] max-h-[90%] overflow-hidden flex flex-grow h-full"
        shadow="lg"
        radius="none"
      >
        <CardHeader>
          <div className="grid grid-cols-3 w-full items-center">
            <AppLogo />
            <h2
              className="text-2xl font-bold hidden md:block col-start-2 text-center truncate"
              title={title}
            >
              {title}
            </h2>
            <div className="full-screen-modal-header-actions flex gap-2 items-center justify-end col-start-3">
              <Button
                isIconOnly
                onClick={onClose}
                className=" min-w-[2rem!important] w-[2rem!important] h-[2rem!important] min-h-[2rem!important] flex text-sm p-0 hover:text-red-600 transition-colors rounded-full bg-transparent border border-gray-200 dark:border-gray-600"
              >
                <IoMdClose />
              </Button>
              <span className="px-2 py-1 h-[content] font-medium text-[0.6rem] space-x-0.5 flex items-center text-xs rounded-small bg-white border dark:bg-transparent border-gray-200 shadow-all-sides dark:border-gray-600">
                <span>ESC</span>
              </span>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="flex flex-col items-center overflow-auto [&::-webkit-scrollbar]:hidden">
          {children}
        </CardBody>
      </Card>
    </div>
  );
};

export default FullScreenModal;
