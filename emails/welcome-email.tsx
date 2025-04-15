import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name?: string | null;
  appName?: string;
  appUrl?: string;
}

const baseUrl = process.env.NEXTAUTH_URL
  ? `${process.env.NEXTAUTH_URL}`
  : "http://localhost:3000";

export const WelcomeEmail = ({
  name = "there",
  appName = "Aiprompti.com",
  appUrl = baseUrl,
}: WelcomeEmailProps) => {
  const previewText = `Welcome to ${appName}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/static/logo.png`} // Assuming you have a logo at public/static/logo.png
            width="48"
            height="48"
            alt={`${appName} Logo`}
          />
          <Heading style={heading}>Welcome to {appName}, {name}!</Heading>
          <Text style={text}>
            We're excited to have you on board. {appName} helps you plan and build your next web project with the power of AI.
          </Text>
          <Text style={text}>
            Get started by creating your first project or exploring the features.
          </Text>
          <Button style={button} href={appUrl}>
            Go to {appName}
          </Button>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
};

const heading = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
};

const text = {
  fontSize: "16px",
  fontFamily:
    "\"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif",
  fontWeight: "300",
  color: "#404040",
  lineHeight: "26px",
};

const button = {
  backgroundColor: "#0070f3",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
};
