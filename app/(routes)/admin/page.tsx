import { notFound } from "next/navigation";
import { getModerationQueue } from "@/actions";
import Heading from "@/components/ui/Heading";
import ModerationQueue from "@/components/moderation/ModerationQueue";
import { pageTitle } from "@/components/ui/styles";

export const revalidate = 0;

// Admins only. Everyone else gets the not-found page, so the route
// doesn't advertise itself; the database enforces it either way.
const AdminPage = async () => {
  const queue = await getModerationQueue();
  if (!queue) {
    notFound();
  }

  return (
    <div className="bg-surface rounded-xl h-full w-full overflow-hidden overflow-y-auto">
      <Heading>
        <h1 className={pageTitle}>Moderation</h1>
        <p className="text-muted mt-2">
          Hidden songs disappear for everyone except their uploader and admins.
        </p>
      </Heading>
      <ModerationQueue reported={queue.reported} hidden={queue.hidden} />
    </div>
  );
};

export default AdminPage;
