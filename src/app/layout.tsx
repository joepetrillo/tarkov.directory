import type { Metadata } from "next";
import Header from "@/components/header";
import Footer from "@/components/footer";

import "./globals.css";

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
    <html lang="en" className="bg-stone-950 font-sans text-eft-white">
      <body className="flex min-h-[100dvh] flex-col overflow-y-scroll">
        <Header />
        <main className="mx-auto w-full max-w-3xl px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
