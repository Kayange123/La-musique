import Sidebar from "@/components/sidebar/Sidebar";
import "./globals.css";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import SupabaseProvider from "@/providers/Supabase";
import UserProvider from "@/providers/UserProvider";
import ModalProvider from "@/providers/ModalProvider";
import ToastProvider from "@/providers/ToastProvider";
import { getPlaylists, getSongsByUserId } from "@/actions";
import MediaPlayer from "@/components/player/MediaPlayer";
import MobileNav from "@/components/nav/MobileNav";

const font = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Musics zone",
  description: "Play your favorites now",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [songs, playlists] = await Promise.all([
    getSongsByUserId(),
    getPlaylists(),
  ]);
  return (
    <html lang="en">
      <body className={font.className}>
        <ToastProvider />
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider />
            <Sidebar songs={songs} playlists={playlists}>
              {children}
            </Sidebar>
            <MediaPlayer />
            <MobileNav />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
