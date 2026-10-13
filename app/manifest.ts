import type { MetadataRoute } from "next";

// Lets browsers install La-musique to the home screen as a full-screen
// app. Offline playback isn't supported, so there's no service worker.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La-musique",
    short_name: "La-musique",
    description: "Upload, share and listen to music.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
