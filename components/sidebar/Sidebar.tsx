"use client";
import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import Container from "../ui/Container";
import SidebarItem from "./SidebarItem";
import Library from "../Library/Library";
import { ISong } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import { twMerge } from "tailwind-merge";

interface SidebarProps {
  children: React.ReactNode;
  songs: ISong[];
}

const Sidebar = ({ children, songs }: SidebarProps) => {
  const pathname = usePathname();
  const player = usePlayer();
  const routes = useMemo(
    () => [
      {
        icon: HiHome,
        label: "Home",
        active: pathname !== "/search",
        href: "/",
      },
      {
        icon: BiSearch,
        label: "Search",
        active: pathname === "/search",
        href: "/search",
      },
    ],
    [pathname]
  );
  return (
    <div
      className={twMerge(
        "flex h-full",
        player.activeId && "h-[calc(100%-85px)]"
      )}
    >
      <div className="hidden md:flex flex-col gap-y-2 w-[300px] h-full bg-black p-2">
        <Container>
          <div className="flex flex-col gap-y-4 px-5 py-5">
            {routes.map((route) => (
              <SidebarItem key={route.label} {...route} />
            ))}
          </div>
        </Container>
        <Container className="overflow-y-auto h-full">
          <Library songs={songs} />
        </Container>
      </div>
      <main className="h-full flex-1 overflow-y-auto py-2">{children}</main>
    </div>
  );
};

export default Sidebar;
