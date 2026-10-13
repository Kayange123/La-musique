import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, disabled, ...props }, ref) => (
    <input
      className={twMerge(
        "flex h-11 w-full rounded-lg border border-line bg-overlay px-3 text-[15px] text-fg transition file:border-0 file:bg-transparent file:font-medium file:text-fg placeholder:text-muted focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      type={type}
      disabled={disabled}
      ref={ref}
      {...props}
    />
  ),
);

Input.displayName = "Input";
export default Input;
