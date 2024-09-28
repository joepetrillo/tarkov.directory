import type { Metadata } from "next";
import { Theme } from "@radix-ui/themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";

import "./globals.css";

const Bender = localFont({
  src: [
    {
      path: "../../public/fonts/Bender-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Bender.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Bender-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-bender",
});

export const metadata: Metadata = {
  title: "Tarkov Directory",
  description:
    "Tools and tips to help you survive more raids in Escape from Tarkov.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${Bender.variable} ${GeistMono.variable}`}>
      <body className="overflow-y-scroll bg-[#111110] subpixel-antialiased">
        <Theme
          appearance="dark"
          accentColor="gold"
          grayColor="sand"
          panelBackground="solid"
          radius="none"
          className="text-accent-12"
        >
          {children}
        </Theme>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
