import Sidebar from "@/components/sidebar/Sidebar";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import SupabaseProvider from "@/providers/Supabase";
import UserProvider from "@/providers/UserProvider";
import ModalProvider from "@/providers/ModalProvider";
import ToastProvider from "@/providers/ToastProvider";
import { getPlaylists, getSongsByUserId } from "@/actions";
import MediaPlayer from "@/components/player/MediaPlayer";
import MobileNav from "@/components/nav/MobileNav";
import InstallPrompt from "@/components/nav/InstallPrompt";

const font = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La-musique",
  description: "Upload, share and listen to music.",
  applicationName: "La-musique",
  // iPhone home-screen install: full screen, with its own icon.
  appleWebApp: {
    capable: true,
    title: "La-musique",
    statusBarStyle: "black",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
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
            <InstallPrompt />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
