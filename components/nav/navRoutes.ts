import { IconType } from "react-icons";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { TbPlaylist } from "react-icons/tb";

export interface NavRoute {
  icon: IconType;
  label: string;
  href: string;
  active: boolean;
  // Only shown in the mobile tab bar; desktop has the library in the sidebar.
  mobileOnly?: boolean;
}

export const getNavRoutes = (pathname: string): NavRoute[] => [
  {
    icon: HiHome,
    label: "Home",
    href: "/",
    active: !["/search", "/library"].includes(pathname),
  },
  {
    icon: BiSearch,
    label: "Search",
    href: "/search",
    active: pathname === "/search",
  },
  {
    icon: TbPlaylist,
    label: "Library",
    href: "/library",
    active: pathname === "/library",
    mobileOnly: true,
  },
];
