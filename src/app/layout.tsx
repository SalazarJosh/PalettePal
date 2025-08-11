import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PalettePal - Color Palette Tool",
  description: "Create, manage, and organize beautiful color palettes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
