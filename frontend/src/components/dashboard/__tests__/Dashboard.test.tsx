import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { Dashboard } from "../Dashboard";
import { SnackbarProvider } from "../../../context/SnackbarContext";
import { ICompensation } from "../../../../../shared-types/types";

const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

// Mock compensation queries — we'll override getUsersCompensation per test.
vi.mock("../../../queries/compensationQueries", () => ({
  getUsersCompensation: vi.fn(),
  getAllCompensations: vi.fn(() => Promise.resolve([])),
  getLocationCompensations: vi.fn(() => Promise.resolve([])),
  uploadVerificationDocument: vi.fn(() => new Promise(() => {})),
}));

// Mock salary comparison query used by CompensationCards.
vi.mock("../../../queries/salaryComparisonQueries", () => ({
  getSalaryComparison: vi.fn(() => new Promise(() => {})),
}));

// Stub the LocationCompensationChart to avoid recharts rendering quirks in jsdom.
vi.mock("../LocationCompensationChart", () => ({
  default: () => <div data-testid="location-chart-stub" />,
}));

import { getUsersCompensation } from "../../../queries/compensationQueries";

const baseComp: ICompensation = {
  id: "comp-1",
  user_id: "user-1",
  company: "Acme Vet",
  location: "Boston, MA",
  title: "Associate Vet",
  is_specialist: false,
  specialization: null,
  type_of_practice: "Small animal",
  is_new_grad: false,
  years_of_experience: 3,
  base_salary: 120000,
  hourly_rate: null,
  payment_frequency: "annually",
  sign_on_bonus: null,
  average_annual_production: null,
  percent_production: null,
  total_compensation: 120000,
  gender: null,
  number_of_veterinarians: 4,
  days_worked_per_week: 4,
  email: null,
  is_verified: true,
  is_approved: false,
  verification_document_url: undefined,
  verification_document_name: null,
  verification_document_original_name: undefined,
  needs_review: false,
  is_practice_owner: false,
  practice_description: null,
  is_traveling: false,
  travel_notes: null,
};

const makeComp = (overrides: Partial<ICompensation>): ICompensation => ({
  ...baseComp,
  ...overrides,
});

const renderDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SnackbarProvider>
          <Dashboard />
        </SnackbarProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Dashboard 2-year reminder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the over-2-years reminder when ALL user comps are older than 2 years", async () => {
    const old = new Date(Date.now() - TWO_YEARS_MS - 7 * 24 * 60 * 60 * 1000);
    (getUsersCompensation as any).mockResolvedValueOnce([
      makeComp({ id: "a", created_at: old }),
      makeComp({ id: "b", created_at: old }),
    ]);

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText(/over 2 years since you last posted/i)
      ).toBeInTheDocument();
    });
  });

  it("does NOT show the reminder when at least one comp is within 2 years", async () => {
    const old = new Date(Date.now() - TWO_YEARS_MS - 7 * 24 * 60 * 60 * 1000);
    const recent = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    (getUsersCompensation as any).mockResolvedValueOnce([
      makeComp({ id: "a", created_at: old }),
      makeComp({ id: "b", created_at: recent }),
    ]);

    renderDashboard();

    // Wait for the dashboard to finish loading (title shows up after load).
    await waitFor(() => {
      expect(
        screen.getByText(/veterinarycomp dashboard/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText(/over 2 years since you last posted/i)
    ).not.toBeInTheDocument();
  });
});
