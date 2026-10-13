import { getAccountSummary } from "@/actions";
import Heading from "@/components/ui/Heading";
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
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Heading>
        <h1 className="text-white text-3xl font-semibold">Account</h1>
        {account.email && (
          <p className="text-neutral-300 mt-2">{account.email}</p>
        )}
      </Heading>
      <div className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        {stats.map(({ label, value, href }) => (
          <Link
            key={href}
            href={href}
            className="rounded-md bg-neutral-800 p-4 hover:bg-neutral-700 transition"
          >
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-neutral-400 text-sm">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AccountPage;
