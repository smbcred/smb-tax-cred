import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelpWidget } from '@/components/help/HelpWidget';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

// Mock wouter
vi.mock('wouter', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}));

describe('HelpWidget', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    vi.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders help button with correct positioning', () => {
    renderWithProvider(<HelpWidget position="bottom-right" />);
    
    const helpButton = screen.getByRole('button', { name: /help/i });
    expect(helpButton).toBeInTheDocument();
    expect(helpButton).toHaveTextContent('Help');
  });

  it('opens help dialog when clicked', async () => {
    renderWithProvider(<HelpWidget />);
    
    const helpButton = screen.getByRole('button', { name: /help/i });
    fireEvent.click(helpButton);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Help')).toBeInTheDocument();
    });
  });

  it('displays search functionality in dialog', async () => {
    renderWithProvider(<HelpWidget />);
    
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search for help...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('filters help items based on search query', async () => {
    renderWithProvider(<HelpWidget />);
    
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search for help...');
      fireEvent.change(searchInput, { target: { value: 'calculator' } });
      
      expect(screen.getByText('How do I use the calculator?')).toBeInTheDocument();
    });
  });

  it('shows contextual help when page context is provided', () => {
    renderWithProvider(<HelpWidget pageContext="calculator" showQuickHelp={true} />);
    
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    
    expect(screen.getByText('Help for this page')).toBeInTheDocument();
  });

  it('displays quick action buttons', async () => {
    renderWithProvider(<HelpWidget />);
    
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Help Center')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });
  });

  it('shows frequently asked questions', async () => {
    renderWithProvider(<HelpWidget />);
    
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Frequently Asked')).toBeInTheDocument();
      expect(screen.getByText('How do I use the calculator?')).toBeInTheDocument();
    });
  });

  it('handles different positioning classes', () => {
    const { rerender } = renderWithProvider(<HelpWidget position="top-left" />);
    expect(screen.getByRole('button', { name: /help/i }).closest('div')).toHaveClass('top-4', 'left-4');
    
    rerender(
      <QueryClientProvider client={queryClient}>
        <HelpWidget position="bottom-left" />
      </QueryClientProvider>
    );
    expect(screen.getByRole('button', { name: /help/i }).closest('div')).toHaveClass('bottom-4', 'left-4');
  });

  it('shows no results message when search has no matches', async () => {
    renderWithProvider(<HelpWidget />);
    
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search for help...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent query' } });
      
      expect(screen.getByText('No help items found.')).toBeInTheDocument();
    });
  });

  it('handles learn more links correctly', async () => {
    renderWithProvider(<HelpWidget />);
    
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    
    await waitFor(() => {
      const learnMoreLinks = screen.getAllByText('Learn more');
      expect(learnMoreLinks.length).toBeGreaterThan(0);
    });
  });
});