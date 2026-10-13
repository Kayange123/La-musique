import { getAccountSummary } from "@/actions";
import Heading from "@/components/ui/Heading";
import { pageTitle } from "@/components/ui/styles";
import Link from "next/link";
import { redirect } from "next/navigation";

export const revalidate = 0;

const AccountPage = async () => {
  const account = await getAccountSummary();
  if (!account) {
    redirect("/");
  }

  const stats = [
    { label: "Songs uploaded", value: account.uploadCount, href: "/library" },
    { label: "Liked songs", value: account.likeCount, href: "/liked-songs" },
  ];

  return (
    <div className="bg-surface rounded-xl h-full w-full overflow-hidden overflow-y-auto">
      <Heading>
        <h1 className={pageTitle}>Account</h1>
        {account.email && <p className="text-muted mt-2">{account.email}</p>}
      </Heading>
      <div className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        {stats.map(({ label, value, href }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl bg-raised p-5 hover:bg-overlay transition"
          >
            <p className="font-display text-4xl font-bold text-fg">{value}</p>
            <p className="text-muted text-sm">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AccountPage;
