import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", children, disabled, ...props }, ref) => {
    return (
      <button
        type={type}
        className={twMerge(
          "w-full rounded-full bg-green-500 border border-transparent px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold hover:opacity-75 transition",
          className
        )}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
