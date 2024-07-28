// app/components/PanelButtons.tsx
"use client";

import React, { ReactNode } from "react";
import { useSidePanel } from "@/contexts/SidePanelContext";
import { Button } from "@nextui-org/react";

interface PanelButtonsProps {
  LeftContent: ReactNode;
  RightContent: ReactNode;
}

export default function PanelButtons({
  LeftContent,
  RightContent,
}: PanelButtonsProps) {
  const { openLeftPanel, openRightPanel } = useSidePanel();

  const handleOpenLeftPanel = () => {
    openLeftPanel(LeftContent);
  };

  const handleOpenRightPanel = () => {
    openRightPanel(RightContent, "400px");
  };

  return (
    <div className="space-x-4">
      <Button color="primary" onClick={handleOpenLeftPanel}>
        Open Left Panel
      </Button>
      <Button color="secondary" onClick={handleOpenRightPanel}>
        Open Right Panel
      </Button>
    </div>
  );
}
