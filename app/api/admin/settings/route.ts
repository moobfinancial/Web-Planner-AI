import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// Helper function to convert array of settings to key-value object
const settingsToObject = (settings: { key: string; value: string }[]) => {
  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);
};

/**
 * GET /api/admin/settings
 * Fetches all system settings.
 * Requires ADMIN role.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.ADMIN) {
    console.warn("Unauthorized attempt to fetch settings:", session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    console.log("Fetching settings requested by:", session.user.email);
    // Return placeholder data for now
    const placeholderSettings = {
      siteName: "WebPlanner (Default)",
      siteDescription: "AI Planning Tool (Default)",
      contactEmail: "default@example.com",
      maxPlansPerUser: "5",
      defaultPlanVisibility: "private",
      smtpServer: "",
      smtpPort: "",
      smtpUsername: "",
      senderName: "",
      senderEmail: "",
      enableEmailNotifications: "false",
      defaultTheme: "system",
      enableDarkMode: "true",
      primaryColor: "#06b6d4",
      accentColor: "#0ea5e9",
      customCss: "",
    }
    return NextResponse.json(placeholderSettings);
  } catch (error) { // Keep basic error handling
    console.error("Error fetching placeholder settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

/**
 * POST /api/admin/settings
 * Updates multiple system settings.
 * Requires ADMIN role.
 * Expects body: { settingKey1: value1, settingKey2: value2, ... }
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const settings = await request.json();
    console.log("Received settings to save:", settings);
    console.log("Settings updated by:", session.user.email);
    // TODO: Implement actual logic to save settings, perhaps to a config file or database
    // Placeholder response
    return NextResponse.json({ message: "Settings update received (not implemented)" }, { status: 200 });
  } catch (error) {
    console.error("Error updating system settings:", error);
    if (error instanceof SyntaxError) { // Handle JSON parsing error
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
