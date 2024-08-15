// contexts/FullScreenModalContext.tsx

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import FullScreenModal from '../components/FullScreenModal';

interface ModalOptions {
  centerHeaderContents?: boolean;
  disableEscape?: boolean;
  height?: string;
  showCloseButton?: boolean;
  showEscapeHint?: boolean;
  width?: string;
}

interface FullScreenModalContextType {
  closeFullScreenModal: () => void;
  isOpen: boolean;
  openFullScreenModal: (
    content: ReactNode,
    title: string,
    options?: ModalOptions,
  ) => void;
}

const FullScreenModalContext = createContext<FullScreenModalContextType | null>(
  null,
);

export const FullScreenModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [content, setContent] = useState<ReactNode | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({});
  const [title, setTitle] = useState('');

  const closeFullScreenModal = () => {
    setIsOpen(false);
  };

  const openFullScreenModal = (
    newContent: ReactNode,
    newTitle: string,
    options: ModalOptions = {},
  ) => {
    setContent(newContent);
    setModalOptions(options);
    setTitle(newTitle);
    setIsOpen(true);
  };

  return (
    <FullScreenModalContext.Provider
      value={{ closeFullScreenModal, isOpen, openFullScreenModal }}
    >
      {children}
      <FullScreenModal
        isOpen={isOpen}
        onClose={closeFullScreenModal}
        title={title}
        {...modalOptions}
      >
        {content}
      </FullScreenModal>
    </FullScreenModalContext.Provider>
  );
};

export const useFullScreenModal = () => {
  const context = useContext(FullScreenModalContext);
  if (context === null) {
    console.warn(
      'useFullScreenModal must be used within a FullScreenModalProvider',
    );
    return {
      closeFullScreenModal: () => {},
      isOpen: false,
      openFullScreenModal: () => {},
    };
  }
  return context;
};
