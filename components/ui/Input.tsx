import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, disabled, ...props }, ref) => (
    <input
      className={twMerge(
        "flex w-full rounded-md border bg-neutral-700 border-transparent p-3 text-sm file:border-0 file:bg-transparent file:font-medium placeholder:text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none",
        className
      )}
      type={type}
      disabled={disabled}
      ref={ref}
      {...props}
    />
  )
);

Input.displayName = "Input";
export default Input;
