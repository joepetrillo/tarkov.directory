import type { Metadata } from "next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Callout, Container, Flex, Theme } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { GeistMono } from "geist/font/mono";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TraderLevelsProvider } from "@/contexts/trader-levels.context";

import "./globals.css";

export const metadata: Metadata = {
  title: "Tarkov Directory",
  description: "Escape from Tarkov gun modding on the web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistMono.variable}`}>
      <body className="overflow-y-scroll bg-[#111110] subpixel-antialiased">
        <NuqsAdapter>
          <Theme
            appearance="dark"
            accentColor="gold"
            grayColor="sand"
            panelBackground="solid"
            radius="none"
            className="text-accent-12"
          >
            <TraderLevelsProvider>
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
                      This site is a work in progress. Expect regular updates
                      and improvements.
                    </Callout.Text>
                  </Callout.Root>
                </Container>
                <Header />
                <Container size="2" px="4" asChild>
                  <main>{children}</main>
                </Container>
                <Footer />
              </Flex>
            </TraderLevelsProvider>
          </Theme>
        </NuqsAdapter>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
