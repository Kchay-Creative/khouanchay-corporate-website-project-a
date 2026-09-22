import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Khouanchay Trading", template: "%s | Khouanchay Trading" },
  description: "Corporate website for Khouanchay Trading.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
