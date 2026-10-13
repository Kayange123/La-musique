import Heading from "./Heading";
import { eyebrow } from "./styles";

interface CollectionHeaderProps {
  label: string;
  title: string;
  description?: string | null;
  songCount: number;
  cover: React.ReactNode;
}

// The warm header band on playlist-like pages: cover, label, big title,
// optional description and the song count.
const CollectionHeader = ({
  label,
  title,
  description,
  songCount,
  cover,
}: CollectionHeaderProps) => (
  <Heading className="bg-band">
    <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end">
      <div className="shrink-0 shadow-2xl">{cover}</div>
      <div className="flex min-w-0 flex-col gap-y-3">
        <p className={eyebrow}>{label}</p>
        <h1 className="font-display text-4xl font-bold leading-none tracking-tight text-fg break-words md:text-6xl">
          {title}
        </h1>
        {description && <p className="max-w-prose text-fg">{description}</p>}
        <p className="text-sm text-muted">
          {songCount} {songCount === 1 ? "song" : "songs"}
        </p>
      </div>
    </div>
  </Heading>
);

export default CollectionHeader;
