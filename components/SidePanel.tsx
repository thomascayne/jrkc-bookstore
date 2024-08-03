// components/SidePanel.tsx

"use client";

import { useSidePanel } from "@/contexts/SidePanelContext";
import { waitSomeTime } from "@/utils/wait-some-time";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
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
    leftIsDismissable,
    rightIsDismissable,
  } = useSidePanel();

  const [isRendered, setIsRendered] = useState(false);

  const isOpen = side === "left" ? isLeftOpen : isRightOpen;
  const closePanel = side === "left" ? closeLeftPanel : closeRightPanel;
  const content = side === "left" ? leftContent : rightContent;
  const width = side === "left" ? leftWidth : rightWidth;
  const isDismissable =
    side === "left" ? leftIsDismissable : rightIsDismissable;

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      waitSomeTime(300);
      setIsRendered(false);
      return;
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={isDismissable ? closePanel : undefined}
    >
      <div
        className={`fixed top-0 ${side}-0 h-full bg-white dark:bg-gray-800 overflow-hidden transition-transform duration-300 ease-in-out transform ${
          isOpen
            ? "translate-x-0"
            : side === "left"
            ? "-translate-x-full"
            : "translate-x-full"
        } ${width || "w-full sm:w-[400px] md:w-[640px] lg:w-[768px]"}`}
        onClick={isDismissable ? closePanel : undefined}
      >
        {content}
      </div>
    </div>
  );
};

export default SidePanel;
