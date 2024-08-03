// components/InputButtonGroup.tsx
import React from "react";
import { Button, Input } from "@nextui-org/react";
import { FaMinus, FaPlus } from "react-icons/fa";

interface InputButtonGroupProps {
  value: number;
  onChange: (value: number) => void;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export default function InputButtonGroup({
  value,
  onChange,
  onDecrement,
  onIncrement,
  min = 0,
  max,
  step = 1,
  disabled = false,
}: InputButtonGroupProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (
      !isNaN(newValue) &&
      (max === undefined || newValue <= max) &&
      newValue >= min
    ) {
      onChange(newValue);
    }
  };

  return (
    <div className="input-button-group flex items-center h-10 gap-0">
      <button
        className={`rounded-r-none rounded-l-md text-white h-[34px] py-1 px-2 w-8 bg-primary-500 ${
          disabled || value <= min ? "bg-primary-300" : ""
        }`}
        disabled={disabled || value <= min}
        onClick={onDecrement}
        type="button"
      >
        <FaMinus className="text-[12px]" />
      </button>
      <input
        className="flex rounded-none text-center justify-center border-t border-b border-gray-200 dark:border-gray-600 focus-visible:border-gray-200 dark:focus-visible:border-gray-600"
        disabled={disabled}
        max={max}
        min={min}
        onChange={handleInputChange}
        step={step}
        style={{
          height: "34px",
          padding: "2px",
          maxWidth: "50px",
          textAlign: "center",
        }}
        type="number"
        value={value.toString()}
      />
      <button
        className="rounded-l-none rounded-r-md text-white h-[34px] py-1 px-2 w-8 bg-primary-500"
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={onIncrement}
        type="button"
      >
        <FaPlus className="text-[12px]" />
      </button>
    </div>
  );
}
