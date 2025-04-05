import { render as rtlRender } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { ReactElement } from 'react';

// Mock session data
export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: null
  },
  expires: new Date(Date.now() + 2 * 86400).toISOString()
};

// Wrapper with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={mockSession}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
};

// Custom render function
const customRender = (ui: ReactElement, options = {}) =>
  rtlRender(ui, { wrapper: AllTheProviders, ...options });

// Mock fetch for API calls
export const mockFetch = (data: any) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
};

// Mock error fetch
export const mockFetchError = (error: string) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error }),
    })
  );
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
