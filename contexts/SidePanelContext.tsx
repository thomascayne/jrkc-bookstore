// contexts/SidePanelContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface SidePanelContentProps {
  content: ReactNode;
  width?: string;
  isDismissable?: boolean;
}

interface SidePanelContextType {
  isLeftOpen: boolean;
  isRightOpen: boolean;
  openLeftPanel: (
    content: ReactNode,
    width?: string,
    isDismissable?: boolean
  ) => void;
  openRightPanel: (
    content: ReactNode,
    width?: string,
    isDismissable?: boolean
  ) => void;
  closeLeftPanel: () => void;
  closeRightPanel: () => void;
  leftContent: ReactNode;
  rightContent: ReactNode;
  leftWidth?: string;
  rightWidth?: string;
  leftIsDismissable: boolean;
  rightIsDismissable: boolean;
}

const SidePanelContext = createContext<SidePanelContextType | undefined>(
  undefined
);

export const SidePanelProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [leftContent, setLeftContent] = useState<SidePanelContentProps>({
    content: null,
  });
  const [rightContent, setRightContent] = useState<SidePanelContentProps>({
    content: null,
  });

  const openLeftPanel = (
    content: ReactNode,
    width?: string,
    isDismissable: boolean = true
  ) => {
    setLeftContent({ content, width, isDismissable });
    setIsLeftOpen(true);
  };

  const openRightPanel = (
    content: ReactNode,
    width?: string,
    isDismissable: boolean = true
  ) => {
    setRightContent({ content, width, isDismissable });
    setIsRightOpen(true);
  };

  const closeLeftPanel = () => {
    setIsLeftOpen(false);
  };

  const closeRightPanel = () => {
    setIsRightOpen(false);
  };

  return (
    <SidePanelContext.Provider
      value={{
        isLeftOpen,
        isRightOpen,
        openLeftPanel,
        openRightPanel,
        closeLeftPanel,
        closeRightPanel,
        leftContent: leftContent.content,
        rightContent: rightContent.content,
        leftWidth: leftContent.width,
        rightWidth: rightContent.width,
        leftIsDismissable: leftContent.isDismissable ?? true,
        rightIsDismissable: rightContent.isDismissable ?? true,
      }}
    >
      {children}
    </SidePanelContext.Provider>
  );
};

export function useSidePanel(): SidePanelContextType {
  const context = useContext(SidePanelContext);
  if (context === undefined) {
    throw new Error("useSidePanel must be used within a SidePanelProvider");
  }
  return context;
}
