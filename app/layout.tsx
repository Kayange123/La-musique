import Sidebar from "@/components/sidebar/Sidebar";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { colors } from "@/lib/theme";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import SupabaseProvider from "@/providers/Supabase";
import UserProvider from "@/providers/UserProvider";
import ModalProvider from "@/providers/ModalProvider";
import ToastProvider from "@/providers/ToastProvider";
import { getPlaylists, getSongsByUserId } from "@/actions";
import MediaPlayer from "@/components/player/MediaPlayer";
import MobileNav from "@/components/nav/MobileNav";
import InstallPrompt from "@/components/nav/InstallPrompt";

// Headings, body text and times (see tailwind.config.ts fontFamily).
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-display",
});
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
});

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
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: colors.canvas,
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
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} font-sans bg-canvas text-fg`}
      >
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
