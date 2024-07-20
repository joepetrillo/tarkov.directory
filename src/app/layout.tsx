import type { Metadata } from "next";
import { Callout, Container, Flex, Theme, ThemePanel } from "@radix-ui/themes";
import Header from "@/components/header";
import Footer from "@/components/footer";

import "@radix-ui/themes/styles.css";
import "./globals.css";
import { InfoCircledIcon } from "@radix-ui/react-icons";

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
      <body className="dark overflow-y-scroll bg-gray-1 text-accent-12 subpixel-antialiased">
        <Theme
          appearance="dark"
          accentColor="gold"
          grayColor="auto"
          panelBackground="solid"
          radius="none"
        >
          <Flex minHeight="100dvh" direction="column">
            <Container size="2" px="4" flexGrow={"0"}>
              <Callout.Root
                variant="surface"
                color="red"
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
          <ThemePanel defaultOpen={false} />
        </Theme>
      </body>
    </html>
  );
}
