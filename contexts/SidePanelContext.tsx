// contexts/SidePanelContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SidePanelContextType {
  isLeftOpen: boolean;
  isRightOpen: boolean;
  leftContent: ReactNode;
  rightContent: ReactNode;
  leftWidth: string;
  rightWidth: string;
  leftTitle: string;
  rightTitle: string;
  leftFooter: ReactNode;
  rightFooter: ReactNode;
  openLeftPanel: (
    content: ReactNode,
    width?: string,
    title?: string,
    footer?: ReactNode
  ) => void;
  openRightPanel: (
    content: ReactNode,
    width?: string,
    title?: string,
    footer?: ReactNode
  ) => void;
  closeLeftPanel: () => void;
  closeRightPanel: () => void;
}

const SidePanelContext = createContext<SidePanelContextType | undefined>(
  undefined
);

export const SidePanelProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [leftContent, setLeftContent] = useState<ReactNode>(null);
  const [rightContent, setRightContent] = useState<ReactNode>(null);
  const [leftWidth, setLeftWidth] = useState("");
  const [rightWidth, setRightWidth] = useState("");
  const [leftTitle, setLeftTitle] = useState("");
  const [rightTitle, setRightTitle] = useState("");
  const [leftFooter, setLeftFooter] = useState<ReactNode>(null);
  const [rightFooter, setRightFooter] = useState<ReactNode>(null);

  const openLeftPanel = (
    content: ReactNode,
    width?: string,
    title?: string,
    footer?: ReactNode
  ) => {
    setLeftContent(content);
    setLeftWidth(width || "");
    setLeftTitle(title || "");
    setLeftFooter(footer || null);
    setIsLeftOpen(true);
  };

  const openRightPanel = (
    content: ReactNode,
    width?: string,
    title?: string,
    footer?: ReactNode
  ) => {
    setRightContent(content);
    setRightWidth(width || "");
    setRightTitle(title || "");
    setRightFooter(footer || null);
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
        leftContent,
        rightContent,
        leftWidth,
        rightWidth,
        leftTitle,
        rightTitle,
        leftFooter,
        rightFooter,
        openLeftPanel,
        openRightPanel,
        closeLeftPanel,
        closeRightPanel,
      }}
    >
      {children}
    </SidePanelContext.Provider>
  );
};

export const useSidePanel = () => {
  const context = useContext(SidePanelContext);
  if (context === undefined) {
    throw new Error("useSidePanel must be used within a SidePanelProvider");
  }
  return context;
};
