import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { UserProvider } from "@/contexts/user-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "recipeasy - Save and organize your favorite recipes",
  description:
    "The easiest way to save, organize, and discover your favorite recipes from around the web",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
