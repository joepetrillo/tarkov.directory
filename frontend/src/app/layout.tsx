import type { Metadata } from "next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Callout, Container, Flex, Theme } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
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
          <Flex minHeight="100dvh" direction="column">
            <Container size="2" px="4" flexGrow={"0"}>
              <Callout.Root
                variant="surface"
                color="tomato"
                size={"1"}
                className="mt-5"
              >
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>
                  This site is a work in progress. Expect regular updates and
                  improvements.
                </Callout.Text>
              </Callout.Root>
            </Container>
            <Header />
            <Container size="2" px="4" asChild>
              <main>{children}</main>
            </Container>
            <Footer />
          </Flex>
        </Theme>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
