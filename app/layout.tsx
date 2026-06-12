import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoomStager — AI Virtual Staging",
  description: "Przekształć brudne lub puste pomieszczenie w pięknie umeblowane wnętrze w kilka sekund.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
