import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserFeedbackWidget } from '@/components/testing/UserFeedbackWidget';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

// Mock the queryClient
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn()
}));

describe('UserFeedbackWidget', () => {
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

  it('renders float trigger by default', () => {
    renderWithProvider(<UserFeedbackWidget />);
    
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });

  it('renders inline widget when trigger is inline', () => {
    renderWithProvider(<UserFeedbackWidget trigger="inline" />);
    
    expect(screen.getByText('Quick Feedback')).toBeInTheDocument();
    expect(screen.getByText('Help us improve this page')).toBeInTheDocument();
  });

  it('opens feedback dialog when button is clicked', async () => {
    renderWithProvider(<UserFeedbackWidget trigger="button" />);
    
    fireEvent.click(screen.getByText('Give Feedback'));
    
    await waitFor(() => {
      expect(screen.getByText('Share Your Feedback')).toBeInTheDocument();
    });
  });

  it('shows required form fields in dialog', async () => {
    renderWithProvider(<UserFeedbackWidget trigger="button" />);
    
    fireEvent.click(screen.getByText('Give Feedback'));
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Feedback Type/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    });
  });

  it('shows rating when showRating is enabled', async () => {
    renderWithProvider(<UserFeedbackWidget trigger="button" showRating={true} />);
    
    fireEvent.click(screen.getByText('Give Feedback'));
    
    await waitFor(() => {
      expect(screen.getByText('Overall Rating (1-10)')).toBeInTheDocument();
    });
  });

  it('shows NPS score when showNPS is enabled', async () => {
    renderWithProvider(<UserFeedbackWidget trigger="button" showNPS={true} />);
    
    fireEvent.click(screen.getByText('Give Feedback'));
    
    await waitFor(() => {
      expect(screen.getByText('How likely are you to recommend us? (0-10)')).toBeInTheDocument();
    });
  });

  it('displays context badges when page and feature are provided', async () => {
    renderWithProvider(
      <UserFeedbackWidget 
        trigger="button" 
        page="/calculator" 
        feature="expense-input" 
      />
    );
    
    fireEvent.click(screen.getByText('Give Feedback'));
    
    await waitFor(() => {
      expect(screen.getByText('Page: /calculator')).toBeInTheDocument();
      expect(screen.getByText('Feature: expense-input')).toBeInTheDocument();
    });
  });

  it('validates required fields before submission', async () => {
    const { toast } = await import('@/hooks/use-toast');
    
    renderWithProvider(<UserFeedbackWidget trigger="button" />);
    
    fireEvent.click(screen.getByText('Give Feedback'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Submit Feedback'));
    });

    expect(toast).toHaveBeenCalledWith({
      title: "Missing Information",
      description: "Please provide both a title and description for your feedback.",
      variant: "destructive"
    });
  });

  it('handles rating selection correctly', async () => {
    renderWithProvider(<UserFeedbackWidget trigger="button" showRating={true} />);
    
    fireEvent.click(screen.getByText('Give Feedback'));
    
    await waitFor(() => {
      const ratingButton = screen.getByRole('button', { name: '8' });
      fireEvent.click(ratingButton);
      
      // Button should have different styling when selected
      expect(ratingButton).toHaveClass('bg-primary');
    });
  });

  it('handles NPS score selection correctly', async () => {
    renderWithProvider(<UserFeedbackWidget trigger="button" showNPS={true} />);
    
    fireEvent.click(screen.getByText('Give Feedback'));
    
    await waitFor(() => {
      const npsButton = screen.getByRole('button', { name: '9' });
      fireEvent.click(npsButton);
      
      // Button should have different styling when selected
      expect(npsButton).toHaveClass('bg-primary');
    });
  });

  it('shows quick feedback options for inline widget', () => {
    renderWithProvider(<UserFeedbackWidget trigger="inline" />);
    
    // Should show thumbs up, thumbs down, and bug report buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it('pre-fills form when positive quick feedback is clicked', async () => {
    renderWithProvider(<UserFeedbackWidget trigger="inline" />);
    
    // Click thumbs up
    const thumbsUpButton = screen.getAllByRole('button')[1]; // Second button should be thumbs up
    fireEvent.click(thumbsUpButton);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Positive feedback')).toBeInTheDocument();
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    renderWithProvider(<UserFeedbackWidget trigger="button" />);
    
    fireEvent.click(screen.getByText('Give Feedback'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Cancel'));
    });

    await waitFor(() => {
      expect(screen.queryByText('Share Your Feedback')).not.toBeInTheDocument();
    });
  });
});