import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PaymentConfirmationEmailProps {
  name?: string | null;
  orderId?: string;
  amount?: string;
  appName?: string;
  planName?: string;
}

const baseUrl = process.env.NEXTAUTH_URL
  ? `${process.env.NEXTAUTH_URL}`
  : "http://localhost:3000";

export const PaymentConfirmationEmail = ({
  name = "there",
  orderId = "MOCK_ORDER_ID",
  amount = "$XX.XX",
  appName = "Web Planner AI",
  planName = "Your Plan",
}: PaymentConfirmationEmailProps) => {
  const previewText = `Your ${appName} Order Confirmation`;

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
          <Heading style={heading}>Thanks for your order, {name}!</Heading>
          <Text style={text}>
            Your payment for the <strong>{planName}</strong> plan on {appName} was successful.
          </Text>
          <Text style={text}>
            Order ID: {orderId}
            <br />
            Amount: {amount}
          </Text>
          <Text style={text}>
            You can manage your subscription in your account settings.
          </Text>
          {/* Add link to account settings when available */}
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentConfirmationEmail;

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
