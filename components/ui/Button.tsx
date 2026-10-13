import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", children, disabled, ...props }, ref) => {
    return (
      <button
        type={type}
        className={twMerge(
          "h-11 w-full rounded-full bg-accent px-4 font-bold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
