"use client";
import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import Container from "../ui/Container";
import SidebarItem from "./SidebarItem";
import Library from "../Library/Library";
import { IPlaylist, ISong } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import { twMerge } from "tailwind-merge";
import { getNavRoutes } from "../nav/navRoutes";

interface SidebarProps {
  children: React.ReactNode;
  songs: ISong[];
  playlists: IPlaylist[];
}

const Sidebar = ({ children, songs, playlists }: SidebarProps) => {
  const pathname = usePathname();
  const player = usePlayer();
  const routes = useMemo(
    () => getNavRoutes(pathname).filter((route) => !route.mobileOnly),
    [pathname],
  );
  return (
    <div
      className={twMerge(
        // Leave room for the mobile tab bar (4rem) and the player (85px).
        "flex h-[calc(100%-4rem)] md:h-full",
        player.activeId && "h-[calc(100%-4rem-85px)] md:h-[calc(100%-85px)]",
      )}
    >
      <div className="hidden md:flex flex-col gap-y-2 w-[300px] h-full bg-black p-2">
        <Container>
          <nav aria-label="Main" className="flex flex-col gap-y-4 px-5 py-5">
            {routes.map((route) => (
              <SidebarItem key={route.label} {...route} />
            ))}
          </nav>
        </Container>
        <Container className="overflow-y-auto h-full">
          <Library songs={songs} playlists={playlists} />
        </Container>
      </div>
      <main className="h-full flex-1 overflow-y-auto py-2">{children}</main>
    </div>
  );
};

export default Sidebar;
