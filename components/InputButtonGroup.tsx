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
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleIncrement = () => {
    if (value < maxQuantity) {
      const newValue = value + 1;
      onChange(newValue);
      setInputValue(newValue.toString());
    } else {
      setShowMaxTooltip(true);
      setTimeout(() => setShowMaxTooltip(false), 2000);
    }
  };

  const handleDecrement = () => {
    if (value > minQuantity) {
      const newValue = value - 1;
      onChange(newValue);
      setInputValue(newValue.toString());
    } else {
      setShowMinTooltip(true);
      setTimeout(() => setShowMinTooltip(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^\d]/g, '');
    setInputValue(newValue);
    setInputValue(newValue);

    if (newValue === "") return;

    const parsedValue = parseInt(newValue, 10);

    if (isNaN(parsedValue)) {
      return;
    } else if (parsedValue < minQuantity) {
      setShowMinTooltip(true);
      setTimeout(() => setShowMinTooltip(false), 2000);
    } else if (parsedValue > maxQuantity) {
      setShowMaxTooltip(true);
      setTimeout(() => setShowMaxTooltip(false), 2000);
    } else {
      onChange(parsedValue);
    }
  };


    const handleBlur = () => {
    if (inputValue === "" || parseInt(inputValue, 10) < minQuantity) {
      setInputValue(minQuantity.toString());
      onChange(minQuantity);
    } else if (parseInt(inputValue, 10) > maxQuantity) {
      setInputValue(maxQuantity.toString());
      onChange(maxQuantity);
    }
  }

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
          inputMode="numeric"
          onBlur={handleBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          name={inputValue}
          pattern="[0-9]*"
          style={{
            height: "28px",
            maxWidth: "50px",
            padding: "0px !important",
            borderRadius: "0px",
            textAlign: "center",
          }}
          type="text"
          value={inputValue}
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
