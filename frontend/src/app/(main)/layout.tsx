import Footer from "@/components/footer";
import Header from "@/components/header/header";
import VerifyEmailAlertAsync from "@/components/header/verify-email-alert.async";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Container, Callout, Flex } from "@radix-ui/themes";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
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
        <Suspense>
          <VerifyEmailAlertAsync />
        </Suspense>
      </Container>
      <Header />
      <Container size="2" px="4" asChild>
        <main>{children}</main>
      </Container>
      <Footer />
    </Flex>
  );
}
