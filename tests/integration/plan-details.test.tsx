import { render, screen, waitFor } from '../utils/test-utils';
import { PlanDetails } from '@/components/plan-details'; 
import { mockFetch } from '../utils/test-utils'; 
import { Project, Plan, PlanType, ProjectStatus, Role } from '@prisma/client'; 
import { User } from 'next-auth'; 
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useParams: () => ({ 
    planId: 'test-plan-id-1', 
  }),
}));

jest.mock('react-markdown', () => (props: any) => {
  return <div data-testid="mock-react-markdown">{props.children}</div>;
});

const mockUser: User & { role: Role } = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  role: Role.USER,
};

const mockProject: Project & { plans: Plan[] } = {
  id: 'test-project-id',
  userId: mockUser.id,
  projectName: 'Test Project Name', 
  projectDescription: 'A sample project for testing.', 
  status: ProjectStatus.IN_PROGRESS, 
  codeEditor: 'VSCode',
  targetAudience: 'Developers',
  keyGoals: 'Test goals',
  createdAt: new Date(),
  updatedAt: new Date(),
  plans: [
    {
      id: 'test-plan-id-1', 
      projectId: 'test-project-id',
      versionNumber: 1,
      planType: PlanType.INITIAL, 
      planContent: `
# Executive Summary
This is the summary.

## Target Audience
Developers.

## Marketing Objectives
Increase signups.
      `,
      researchData: null,
      triggeringFeedbackText: null,
      prompts: null,
      createdAt: new Date(),
    },
  ],
};

const mockOnRefinementSuccess = jest.fn();

describe('PlanDetails Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnRefinementSuccess.mockClear();
    global.fetch = jest.fn(); 
  });

  it('renders sections from the plan content', async () => {
    global.fetch = mockFetch(mockProject.plans[0]); 

    render(<PlanDetails 
      planId={mockProject.plans[0].id} 
      initialPlanVersion={mockProject.plans[0]} 
      onRefinementSuccess={mockOnRefinementSuccess} 
    />);

    // Wait for the single section heading based on current parsing logic
    expect(await screen.findByRole('heading', { name: /SUMMARY/i, level: 3 })).toBeInTheDocument();

    // Check for content within the rendered section
    expect(await screen.findByText(/This is the summary./i)).toBeInTheDocument();
    expect(await screen.findByText(/Developers./i)).toBeInTheDocument();
    expect(await screen.findByText(/Increase signups./i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-react-markdown')).toBeInTheDocument();

    const expectedContent = mockProject.plans[0].planContent;
    if (expectedContent) {
        expect(screen.getByTestId('mock-react-markdown')).toHaveTextContent(expectedContent);
    } else {
        expect(screen.getByTestId('mock-react-markdown')).toHaveTextContent('');
    }
  });

  it('renders without crashing when initial data is provided', () => {
    render(<PlanDetails 
      planId={mockProject.plans[0].id} 
      initialPlanVersion={mockProject.plans[0]} 
      onRefinementSuccess={mockOnRefinementSuccess} 
    />);
    expect(screen.queryByText(/Loading Plan/i)).not.toBeInTheDocument(); 
  });

  it('allows selecting and deselecting suggestions', async () => {
    const user = userEvent.setup();
    const planWithSuggestions = {
      ...mockProject.plans[0],
      planContent: JSON.stringify({
        planText: "## Section1\nText1",
        suggestions: [
          { id: 'sugg-1', text: 'Suggestion 1', justification: 'Reason 1', selected: false, rank: 1 },
          { id: 'sugg-2', text: 'Suggestion 2', justification: 'Reason 2', selected: true, rank: 2 }, 
        ]
      })
    };

    render(<PlanDetails 
      planId={planWithSuggestions.id} 
      initialPlanVersion={planWithSuggestions} 
      onRefinementSuccess={mockOnRefinementSuccess} 
    />);

    const checkbox1 = await screen.findByLabelText(/Suggestion 1/i);
    const checkbox2 = await screen.findByLabelText(/Suggestion 2/i);

    expect(checkbox1).not.toBeChecked();
    expect(checkbox2).toBeChecked();

    await user.click(checkbox1);
    expect(checkbox1).toBeChecked();
    expect(checkbox2).toBeChecked(); 

    await user.click(checkbox2);
    expect(checkbox1).toBeChecked(); 
    expect(checkbox2).not.toBeChecked();
  });

  it.skip('allows submitting feedback and calls refinement handler', async () => {
    // TODO: Implement this test
  });
});
