import type { Metadata } from "next";
import { Callout, Container, Flex, Theme } from "@radix-ui/themes";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import Providers from "@/app/providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { GeistMono } from "geist/font/mono";

// Base theme tokens
import "@radix-ui/themes/tokens/base.css";

// Include just the colors we want to use
import "@radix-ui/themes/tokens/colors/gold.css";
import "@radix-ui/themes/tokens/colors/sand.css";
import "@radix-ui/themes/tokens/colors/tomato.css";
import "@radix-ui/themes/tokens/colors/jade.css";

// Rest of the CSS
import "@radix-ui/themes/components.css";
import "@radix-ui/themes/utilities.css";
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
    <html lang="en" className={`${GeistMono.variable}`}>
      <body className="overflow-y-scroll bg-[#111110] subpixel-antialiased">
        <Providers>
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
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
