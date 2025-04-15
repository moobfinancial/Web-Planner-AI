import { Resend } from 'resend';
import { render } from '@react-email/render';
import React from 'react';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not set. Email sending will be disabled.');
}

if (!resendFromEmail) {
  console.warn('RESEND_FROM_EMAIL is not set. Email sending will be disabled.');
}

// Initialize Resend only if API key is available
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

/**
 * Sends an email using Resend.
 * @param options - Email options including recipient, subject, and React component.
 */
export const sendEmail = async ({
  to,
  subject,
  react,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> => {
  if (!resend || !resendFromEmail) {
    const errorMessage = 'Resend is not configured. Missing API key or From email address.';
    console.error(errorMessage);
    // In development, we might not want to throw a hard error, but log it.
    // For production, you might want to throw new Error(errorMessage);
    return { success: false, error: errorMessage };
  }

  try {
    const html = render(react);

    const { data, error: sendError } = await resend.emails.send({
      from: resendFromEmail, // Use the configured 'From' email
      to: to,
      subject: subject,
      html: html,
    });

    if (sendError) {
      console.error('Error sending email via Resend:', sendError);
      // Resend error object typically has name, message, statusCode
      const errorMessage = typeof sendError === 'object' && sendError !== null && 'message' in sendError 
                          ? String(sendError.message) 
                          : 'Unknown Resend error';
      return { success: false, error: errorMessage }; 
    }

    console.log(`Email sent successfully to ${to} with ID: ${data?.id}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to render or send email:', error);
    // Handle errors during rendering or unexpected issues
    const message = error instanceof Error ? error.message : 'Unknown error during email process';
    return { success: false, error: message };
  }
};
