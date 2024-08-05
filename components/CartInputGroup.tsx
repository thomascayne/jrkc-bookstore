// components/InputButtonGroup.tsx

import { Button, ButtonGroup, Input, Tooltip } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

interface InputButtonGroupProps {
  maxQuantity: number;
  disabled?: boolean;
  minQuantity: number;
  onChange: (value: number) => void;
  value: number;
}

export default function InputButtonGroup({
  disabled = false,
  maxQuantity,
  minQuantity,
  onChange,
  value,
}: InputButtonGroupProps) {
  const [showMinTooltip, setShowMinTooltip] = useState(false);
  const [showMaxTooltip, setShowMaxTooltip] = useState(false);

  const handleIncrement = () => {
    if (value < maxQuantity) {
      onChange(value + 1);
    } else {
      setShowMaxTooltip(true);
      setTimeout(() => setShowMaxTooltip(false), 2000);
    }
  };

  const handleDecrement = () => {
    if (value > minQuantity) {
      onChange(value - 1);
    } else {
      setShowMinTooltip(true);
      setTimeout(() => setShowMinTooltip(false), 2000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (
      !isNaN(newValue) &&
      newValue >= minQuantity &&
      newValue <= maxQuantity
    ) {
      onChange(newValue);
    }
  };

  return (
    <div className="input-button-group flex items-center h-10 !gap-0">
      <ButtonGroup className="h-[30px] cart-button-group">
        <Tooltip
          className="py-1 font-semibold text-white"
          color="warning"
          content={`Minimum quantity is ${minQuantity}`}
          isOpen={showMinTooltip}
          placement="left-start"
        >
          <Button
            className={`rounded-l-none text-white h-[30px] bg-primary-500 
            
          `}
            isIconOnly
            onClick={handleDecrement}
            radius="none"
            title="remove"
            type="button"
          >
            <FaMinus className="text-[12px]" />
          </Button>
        </Tooltip>
        <Input
          className="flex rounded-none text-center justify-center border-t border-b border-gray-200 dark:border-gray-600 focus-visible:border-gray-200 dark:focus-visible:border-gray-600"
          disabled={disabled}
          max={maxQuantity}
          min={minQuantity}
          onChange={handleInputChange}
          radius="none"
          size="sm"
          style={{
            height: "28px",
            maxWidth: "50px",
            padding: "0px !important",
            textAlign: "center",
          }}
          type="number"
          value={value.toString()}
        />
        <Tooltip
          className="py-1 font-semibold text-white"
          color="warning"
          content={`Maximum available quantity is ${maxQuantity}`}
          isOpen={showMaxTooltip}
          placement="top-start"
        >
          <Button
            className={`rounded-r-none text-white h-[30px] bg-primary-500 min-w-[28px!important]  ${
              disabled ? "bg-primary-300" : ""
            }`}
            disabled={disabled}
            isIconOnly
            onClick={handleIncrement}
            radius="none"
            style={{ gap: "0px" }}
            title="Increment"
            type="button"
          >
            <FaPlus className="text-[12px]" />
          </Button>
        </Tooltip>
      </ButtonGroup>
    </div>
  );
}
