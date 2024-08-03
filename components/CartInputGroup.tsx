// components/InputButtonGroup.tsx
import React from "react";
import { Button, ButtonGroup, Input } from "@nextui-org/react";
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
  console.log("max: ", max, " min: ", min, " value: ", value);

  return (
    <div className="input-button-group flex items-center h-10 !gap-0">
      <ButtonGroup className="h-[30px] cart-button-group">
        <Button
          className={`rounded-l-none text-white h-[30px] bg-primary-500 ${
            disabled || value >= max! ? "bg-primary-300" : ""
          }`}
          disabled={disabled || value >= max!}
          isIconOnly
          onClick={onDecrement}
          radius="none"
          title="remove"
          type="button"
        >
          <FaMinus className="text-[12px]" />
        </Button>
        <Input
          className="flex rounded-none text-center justify-center border-t border-b border-gray-200 dark:border-gray-600 focus-visible:border-gray-200 dark:focus-visible:border-gray-600"
          disabled={disabled}
          max={max}
          min={min}
          onChange={handleInputChange}
          radius="none"
          size="sm"
          step={step}
          style={{
            height: "28px",
            maxWidth: "50px",
            padding: "0px !important",
            textAlign: "center",
          }}
          type="number"
          value={value.toString()}
        />

        <Button
          className={`rounded-r-none text-white h-[30px] bg-primary-500 min-w-[28px!important]  ${
            disabled ? "bg-primary-300" : ""
          }`}
          disabled={disabled}
          isIconOnly
          onClick={onIncrement}
          radius="none"
          style={{ gap: "0px" }}
          title="Increment"
          type="button"
        >
          <FaPlus className="text-[12px]" />
        </Button>
      </ButtonGroup>
    </div>
  );
}
