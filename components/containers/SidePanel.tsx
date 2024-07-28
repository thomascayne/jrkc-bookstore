// components/SidePanel.tsx

"use client";

import { useSidePanel } from "@/contexts/SidePanelContext";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

interface SidePanelProps {
  side: "left" | "right";
}

const SidePanel: React.FC<SidePanelProps> = ({ side }) => {
  const {
    isLeftOpen,
    isRightOpen,
    closeLeftPanel,
    closeRightPanel,
    leftContent,
    rightContent,
    leftWidth,
    rightWidth,
    leftTitle,
    rightTitle,
    leftFooter,
    rightFooter,
  } = useSidePanel();
  const [isRendered, setIsRendered] = useState(false);

  const isOpen = side === "left" ? isLeftOpen : isRightOpen;
  const closePanel = side === "left" ? closeLeftPanel : closeRightPanel;
  const content = side === "left" ? leftContent : rightContent;
  const width = side === "left" ? leftWidth : rightWidth;
  const title = side === "left" ? leftTitle : rightTitle;
  const footer = side === "left" ? leftFooter : rightFooter;

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <aside
      className={`side-panel-outer-container fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={closePanel}
    >
      <div
        className={`side-panel-inner-container w-full sm:w-[400px] md:w-[640px] ${
          width ? width : "lg:w-[768px]"
        } fixed top-0 ${
          side === "left" ? "left-0" : "right-0"
        } h-full bg-white dark:bg-gray-800 overflow-hidden transition-transform duration-300 ease-in-out transform ${
          isOpen
            ? "translate-x-0"
            : side === "left"
            ? "-translate-x-full"
            : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="side-panel-content-wrapper h-full flex flex-col">
          <div className="side-panel-header flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold truncate">{title}</h2>
            <button
              onClick={closePanel}
              className="side-panel-close-button text-2xl hover:text-red-500 transition-all duration-300 ease-in-out"
            >
              <IoMdClose />
            </button>
          </div>
          <div className="side-panel-content p-4 flex-grow overflow-y-auto">
            {content}
          </div>
          {footer && (
            <section className="side-panel-footer border-t p-4">
              {footer}
            </section>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidePanel;
