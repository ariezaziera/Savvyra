import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Savvyra",
    short_name: "Savvyra",
    description: "Personal Finance Manager",
    start_url: "/",
    id: "/",
    display: "standalone",
    theme_color: "#ffffff",
    background_color: "#ffffff",
    icons: [
      {
        src: "/logo192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",        // 👈 "any" separate dari "maskable"
      },
      {
        src: "/logo192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",        // 👈 "any" separate
      },
      {
        src: "/logo512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/mobile.png",
        sizes: "390x844",
        type: "image/png",
        // @ts-ignore
        form_factor: "narrow",   // mobile
      },
      {
        src: "/screenshots/desktop.png",
        sizes: "1280x800",
        type: "image/png",
        // @ts-ignore
        form_factor: "wide",     // desktop
      },
    ],
  };
}