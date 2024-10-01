import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

// TODO - make the email pretty
export default function VerificationCodeEmail({ code }: { code: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code is {code}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={company}>
            <Link href={baseUrl} style={link}>
              Tarkov Directory
            </Link>
          </Text>
          <Text style={paragraph}>
            We want to make sure it&apos;s really you. Please enter the
            following verification code when prompted. If you don&apos;t want to
            create an account, you can ignore this message.
          </Text>
          <Text style={codeDescription}>
            This code will expire in 15 minutes.
          </Text>
          <Section style={codeContainer}>
            <Heading style={codeStyle}>{code}</Heading>
          </Section>
          <Text style={paragraph}>
            Tarkov Directory will never email you and ask you to disclose or
            verify your password, credit card, or banking information.
          </Text>
          <Text className="my-4 text-center">
            <Link href="mailto:support@tarkov.directory" style={link}>
              support@tarkov.directory
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  textAlign: "center" as const,
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #ddd",
  borderRadius: "5px",
  marginTop: "20px",
  width: "480px",
  maxWidth: "100%",
  margin: "0 auto",
  padding: "12% 6%",
};

const company = {
  fontWeight: "bold",
  fontSize: "24px",
  textAlign: "center" as const,
};

const codeDescription = {
  textAlign: "center" as const,
};

const codeContainer = {
  background: "rgba(0,0,0,.05)",
  borderRadius: "4px",
  margin: "16px auto 14px",
  verticalAlign: "middle",
  maxWidth: "100%",
};

const codeStyle = {
  color: "#000",
  display: "inline-block",
  paddingBottom: "8px",
  paddingTop: "8px",
  margin: "0 auto",
  width: "100%",
  textAlign: "center" as const,
  letterSpacing: "8px",
};

const paragraph = {
  color: "#444",
  letterSpacing: "0",
  padding: "0 40px",
  margin: "0",
  textAlign: "center" as const,
};

const link = {
  color: "#444",
  textDecoration: "underline",
};
