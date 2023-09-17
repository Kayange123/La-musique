import React from "react";
import { twMerge } from "tailwind-merge";
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div
      className={twMerge("bg-neutral-900 h-fit w-full rounded-lg", className)}
    >
      {children}
    </div>
  );
};

export default Container;
