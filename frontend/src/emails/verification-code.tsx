import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

VerificationCodeEmail.PreviewProps = {
  code: "A1B2C3",
};

export default function VerificationCodeEmail({ code }: { code: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code is {code}.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Hr style={global.hr} />
          <Section style={global.defaultPadding}>
            <Heading style={global.heading}>
              <Link href={"https://tarkov.directory"} style={{ color: "#000" }}>
                Tarkov Directory
              </Link>
            </Heading>
            <Text style={global.text}>
              Let&apos;s finish setting up your account. Please enter the
              following verification code when prompted. If you are not
              expecting this email, no action is required.
            </Text>
          </Section>
          <Hr style={global.hr} />
          <Section style={global.defaultPadding}>
            <Heading style={global.code}>{code}</Heading>
            <Text style={global.text}>This code will expire in 15 minutes</Text>
          </Section>
          <Hr style={global.hr} />
          <Section style={global.defaultPadding}>
            <Text style={footer.text}>
              This communication is not affiliated with, endorsed by, or
              officially connected to Battlestate Games. All views expressed are
              personal.
            </Text>
            <Text style={{ ...footer.text, marginTop: "10px" }}>
              <Link
                href="mailto:support@tarkov.directory"
                style={{
                  textDecorationLine: "underline",
                  color: footer.text.color,
                }}
              >
                support@tarkov.directory
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const paddingX = {
  paddingLeft: "40px",
  paddingRight: "40px",
};

const paddingY = {
  paddingTop: "22px",
  paddingBottom: "22px",
};

const paragraph = {
  margin: "0",
  lineHeight: "2",
};

const global = {
  paddingX,
  paddingY,
  defaultPadding: {
    ...paddingX,
    ...paddingY,
  },
  paragraphWithBold: { ...paragraph, fontWeight: "bold" },
  heading: {
    fontSize: "32px",
    lineHeight: "1.3",
    fontWeight: "700",
    letterSpacing: "-1px",
    color: "#000",
  } as React.CSSProperties,
  text: {
    ...paragraph,
    color: "#747474",
    fontWeight: "500",
  },
  code: {
    fontSize: "40px",
    margin: "0",
    fontWeight: "700",
    letterSpacing: "8px",
    whiteSpace: "nowrap",
  } as React.CSSProperties,
  hr: {
    borderColor: "#E5E5E5",
    margin: "0",
  },
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "10px auto",
  width: "100%",
  maxWidth: "500px",
  border: "1px solid #E5E5E5",
};

const footer = {
  text: {
    margin: "0",
    color: "#AFAFAF",
    fontSize: "13px",
  } as React.CSSProperties,
};
