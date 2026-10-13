import Link from "next/link";

interface ListItemProps {
  href: string;
  name: string;
  // The square on the left: a cover, an initial tile, an icon.
  art: React.ReactNode;
}

// A shortcut tile on Home, e.g. Liked songs or a playlist.
const ListItem = ({ href, name, art }: ListItemProps) => (
  <Link
    href={href}
    className="flex h-16 items-center gap-x-4 overflow-hidden rounded-lg bg-raised pr-4 font-semibold text-fg transition hover:bg-overlay"
  >
    <div className="h-16 w-16 shrink-0 overflow-hidden">{art}</div>
    <span className="truncate">{name}</span>
  </Link>
);

export default ListItem;
