import React from "react";
import { twMerge } from "tailwind-merge";
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div className={twMerge("bg-surface h-fit w-full rounded-xl", className)}>
      {children}
    </div>
  );
};

export default Container;
