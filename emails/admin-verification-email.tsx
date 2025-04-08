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

interface AdminVerificationEmailProps {
  name?: string | null;
  verificationUrl?: string;
  appName?: string;
}

const baseUrl = process.env.NEXTAUTH_URL
  ? `${process.env.NEXTAUTH_URL}`
  : "http://localhost:3000";

export const AdminVerificationEmail = ({
  name = "Admin User",
  verificationUrl = `${baseUrl}/verify-admin-email?token=mocktoken`,
  appName = "Web Planner AI",
}: AdminVerificationEmailProps) => {
  const previewText = `Verify your admin email for ${appName}`; // Updated preview text

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/static/logo.png`} // Assuming logo exists
            width="48"
            height="48"
            alt={`${appName} Logo`}
          />
          <Heading style={heading}>Verify Your Admin Email for {appName}</Heading>
          <Text style={text}>
            Hello {name},
          </Text>
          <Text style={text}>
            An admin account has been created for you on {appName}. Please click the button below to verify your email address and activate your account.
          </Text>
          <Button style={button} href={verificationUrl}>
            Verify Email Address
          </Button>
          <Text style={text}>
            If you did not request this, please ignore this email.
          </Text>
          <Text style={text}>
            This link will expire in 24 hours.
          </Text>
          <Text style={text}>
            Or copy and paste this URL into your browser:{
              " "
            }
            <Link href={verificationUrl} style={link}>
              {verificationUrl}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminVerificationEmail;

// Styles are similar to WelcomeEmail, reuse or define separately
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

const link = {
  color: "#0070f3",
};
