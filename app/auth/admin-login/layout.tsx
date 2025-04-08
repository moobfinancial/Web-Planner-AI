'use client'; // Required for layouts in App Router if simple

import React from 'react';

/**
 * Minimal layout for the Admin Login page.
 * Prevents inheriting the main AdminLayout with header/sidebar.
 */
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render children directly without wrapping them in Admin header/sidebar
  return <>{children}</>;
}
