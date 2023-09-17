import Link from "next/link";
import React from "react";
import { IconType } from "react-icons";
import { twMerge } from "tailwind-merge";

interface SidebarItemProps {
  icon: IconType;
  label: string;
  href: string;
  active?: boolean;
}
const SidebarItem = ({ icon: Icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={twMerge(
        "flex flex-row h-auto items-center w-full gap-x-4 text-base font-medium cursor-pointer transition hover:text-white text-neutral-400",
        active && "text-white"
      )}
    >
      <Icon size={25} />
      <p className="w-full truncate">{label}</p>
    </Link>
  );
};

export default SidebarItem;
