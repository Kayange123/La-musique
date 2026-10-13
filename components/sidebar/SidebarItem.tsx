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
      aria-current={active ? "page" : undefined}
      className={twMerge(
        "flex flex-row items-center w-full gap-x-4 rounded-lg px-3 py-3 text-base font-medium text-muted transition hover:text-fg",
        active && "bg-raised font-semibold text-fg",
      )}
    >
      <Icon size={22} aria-hidden="true" />
      <p className="w-full truncate">{label}</p>
    </Link>
  );
};

export default SidebarItem;
