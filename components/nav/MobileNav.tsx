"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { getNavRoutes } from "./navRoutes";

// Bottom tab bar for phones, where the sidebar is hidden.
const MobileNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-black border-t border-neutral-800 flex"
    >
      {getNavRoutes(pathname).map(({ icon: Icon, label, href, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={twMerge(
            "flex-1 flex flex-col items-center justify-center gap-y-1 text-xs text-neutral-400",
            active && "text-white",
          )}
        >
          <Icon size={22} aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default MobileNav;
