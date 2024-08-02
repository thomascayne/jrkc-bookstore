// contexts/FullScreenModalContext.tsx

"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import FullScreenModal from "../components/FullScreenModal";

interface FullScreenModalContextType {
  isOpen: boolean;
  openModal: (content: ReactNode, title: string) => void;
  closeModal: () => void;
}

const FullScreenModalContext = createContext<FullScreenModalContextType | null>(
  null
);

export const useFullScreenModal = () => {
  const context = useContext(FullScreenModalContext);
  if (context === null) {
    console.warn(
      "useFullScreenModal must be used within a FullScreenModalProvider"
    );
    return {
      isOpen: false,
      openModal: () => {},
      closeModal: () => {},
    };
  }
  return context;
};

export const FullScreenModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [title, setTitle] = useState("");

  const openModal = (newContent: ReactNode, newTitle: string) => {
    setContent(newContent);
    setTitle(newTitle);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <FullScreenModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      <FullScreenModal isOpen={isOpen} onClose={closeModal} title={title}>
        {content}
      </FullScreenModal>
    </FullScreenModalContext.Provider>
  );
};
