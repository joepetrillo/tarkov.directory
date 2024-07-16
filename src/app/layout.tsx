import type { Metadata } from "next";
import { Container, Flex, Theme, ThemePanel } from "@radix-ui/themes";
import Header from "@/components/header";
import Footer from "@/components/footer";

import "@radix-ui/themes/styles.css";
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
    <html lang="en">
      <body className="overflow-y-scroll">
        <Theme
          appearance="dark"
          accentColor="gold"
          grayColor="auto"
          panelBackground="solid"
          radius="none"
          className="text-accent-12 subpixel-antialiased"
        >
          <Flex minHeight="100dvh" direction="column">
            <Header />
            <Container size="2" px="4" asChild>
              <main>{children}</main>
            </Container>
            <Footer />
          </Flex>
          <ThemePanel defaultOpen={false} />
        </Theme>
      </body>
    </html>
  );
}
