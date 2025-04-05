import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}));

// Mock Radix UI components
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick} data-testid={`theme-${children?.toString().toLowerCase()}`}>
      {children}
    </button>
  ),
}));

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    });
  });

  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it('renders theme options and handles theme changes', () => {
    render(<ThemeToggle />);

    // Test light theme
    const lightButton = screen.getByTestId('theme-light');
    fireEvent.click(lightButton);
    expect(mockSetTheme).toHaveBeenCalledWith('light');

    // Test dark theme
    const darkButton = screen.getByTestId('theme-dark');
    fireEvent.click(darkButton);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');

    // Test system theme
    const systemButton = screen.getByTestId('theme-system');
    fireEvent.click(systemButton);
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('uses current theme from context', () => {
    // Mock dark theme
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    });

    render(<ThemeToggle />);
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });
});
