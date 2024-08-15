// components/FullScreenModal.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Divider, Button } from '@nextui-org/react';
import { IoMdClose } from 'react-icons/io';
import AppLogo from '@/components/AppLogo';
import { waitSomeTime } from '@/utils/wait-some-time';
import FullScreenOverlay from '@/components/FullScreenOverlay';
import { disableBodyScroll, enableBodyScroll } from '@/utils/bodyScroll.ts';

interface FullScreenModalProps {
  centerHeaderContents?: boolean;
  children: React.ReactNode;
  disableEscape?: boolean;
  height?: string | number;
  isOpen: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  showEscapeHint?: boolean;
  title: string;
  width?: string;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  centerHeaderContents = false,
  children,
  disableEscape = false,
  height = '90%',
  isOpen,
  onClose,
  showCloseButton = true,
  showEscapeHint = true,
  title,
  width = '90%',
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
      if (!disableEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (!disableEscape && isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [disableEscape, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[500] top-0 right-0 bottom-0 left-0 flex items-center justify-center overflow-hidden transition-transform duration-500 ease-in-out transform ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <FullScreenOverlay />
      <Card
        className={`
          overflow-hidden flex flex-grow
          w-full h-full
          sm:w-11/12 sm:h-11/12
          md:w-5/6 md:h-5/6
          lg:w-3/4 lg:h-3/4
          xl:w-2/3 xl:h-2/3
          2xl:w-1/2 2xl:h-1/2`}
        style={{ width, height, maxWidth: width, maxHeight: height }}
        shadow="lg"
        radius="none"
      >
        <CardHeader>
          <div
            className={`grid ${centerHeaderContents ? 'grid-cols-1' : 'grid-cols-3'} w-full items-center`}
          >
            {centerHeaderContents ? (
              <div className="flex flex-col items-center">
                <AppLogo />
                <h2 className="text-2xl font-bold mt-2 truncate" title={title}>
                  {title}
                </h2>
              </div>
            ) : (
              <>
                <AppLogo />
                <h2
                  className="text-2xl font-bold hidden md:block col-start-2 text-center truncate"
                  title={title}
                >
                  {title}
                </h2>
              </>
            )}
            {(showCloseButton || showEscapeHint) && (
              <div
                className={`full-screen-modal-header-actions flex gap-2 items-center justify-end ${centerHeaderContents ? 'absolute top-4 right-4' : 'col-start-3'}`}
              >
                {showCloseButton && (
                  <Button
                    isIconOnly
                    onClick={onClose}
                    className="min-w-[2rem!important] w-[2rem!important] h-[2rem!important] min-h-[2rem!important] flex text-sm p-0 hover:text-red-600 transition-colors rounded-full bg-transparent border border-gray-200 dark:border-gray-600"
                  >
                    <IoMdClose />
                  </Button>
                )}
                {showEscapeHint && (
                  <span className="px-2 py-1 h-[content] font-medium text-[0.6rem] space-x-0.5 flex items-center text-xs rounded-small bg-white border dark:bg-transparent border-gray-200 shadow-all-sides dark:border-gray-600">
                    <span>ESC</span>
                  </span>
                )}
              </div>
            )}
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
