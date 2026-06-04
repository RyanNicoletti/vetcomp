import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import CompensationCards from "../CompensationCards";
import { ICompensation } from "../../../../../shared-types/types";

// Mock the query modules so the component doesn't actually fetch.
vi.mock("../../../queries/salaryComparisonQueries", () => ({
  getSalaryComparison: vi.fn(() => new Promise(() => {})),
}));

vi.mock("../../../queries/compensationQueries", () => ({
  uploadVerificationDocument: vi.fn(() => new Promise(() => {})),
}));

const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

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
  is_approved: true,
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

const renderWithProviders = (compensations: ICompensation[]) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const openSnackbar = vi.fn();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CompensationCards
          compensations={compensations}
          queryClient={queryClient}
          openSnackbar={openSnackbar}
        />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("CompensationCards 2-year cutoff behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Edit Compensation button and no Add New Compensation when comp is under 2 years old", () => {
    const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const comps = [
      makeComp({ id: "c1", title: "Recent Vet", created_at: recentDate }),
    ];

    renderWithProviders(comps);

    expect(
      screen.getByRole("button", { name: /edit compensation/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /add new compensation/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/over 2 years old/i)
    ).not.toBeInTheDocument();
  });

  it("renders warning + Add New Compensation link when the single comp is over 2 years old", () => {
    const oldDate = new Date(Date.now() - TWO_YEARS_MS - 24 * 60 * 60 * 1000); // 2 yrs + 1 day
    const comps = [
      makeComp({ id: "c1", title: "Old Vet", created_at: oldDate }),
    ];

    renderWithProviders(comps);

    expect(
      screen.getByText(/this entry is over 2 years old/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /add new compensation/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /edit compensation/i })
    ).not.toBeInTheDocument();
  });

  it("with two old comps, only the most recent card shows Add New Compensation", () => {
    const newerOld = new Date(
      Date.now() - TWO_YEARS_MS - 7 * 24 * 60 * 60 * 1000
    ); // 2y + 1w
    const olderOld = new Date(
      Date.now() - TWO_YEARS_MS - 365 * 24 * 60 * 60 * 1000
    ); // 3y
    const comps = [
      makeComp({ id: "older", title: "Older Vet", created_at: olderOld }),
      makeComp({ id: "newer", title: "Newer Vet", created_at: newerOld }),
    ];

    renderWithProviders(comps);

    // Both cards show the over-2-years warning
    const warnings = screen.getAllByText(/this entry is over 2 years old/i);
    expect(warnings).toHaveLength(2);

    // Only the most-recent (newer) card has the Add New Compensation link
    const links = screen.getAllByRole("link", {
      name: /add new compensation/i,
    });
    expect(links).toHaveLength(1);

    // Scope: find the "Newer Vet" card and confirm the link sits inside it
    const newerHeading = screen.getByText("Newer Vet");
    const newerCard = newerHeading.closest(".compensation-card") as HTMLElement;
    expect(newerCard).not.toBeNull();
    expect(
      within(newerCard).getByRole("link", { name: /add new compensation/i })
    ).toBeInTheDocument();

    // The older card should NOT have the link
    const olderHeading = screen.getByText("Older Vet");
    const olderCard = olderHeading.closest(".compensation-card") as HTMLElement;
    expect(olderCard).not.toBeNull();
    expect(
      within(olderCard).queryByRole("link", {
        name: /add new compensation/i,
      })
    ).not.toBeInTheDocument();
    expect(
      within(olderCard).getByText(/this entry is over 2 years old/i)
    ).toBeInTheDocument();
  });

  it("with most recent under 2 years and older over 2 years: recent shows Edit, older shows warning only", () => {
    const recent = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
    const oldDate = new Date(
      Date.now() - TWO_YEARS_MS - 30 * 24 * 60 * 60 * 1000
    );
    const comps = [
      makeComp({ id: "old", title: "Older Vet", created_at: oldDate }),
      makeComp({ id: "new", title: "Newer Vet", created_at: recent }),
    ];

    renderWithProviders(comps);

    // The newer card has the Edit button
    const newerHeading = screen.getByText("Newer Vet");
    const newerCard = newerHeading.closest(".compensation-card") as HTMLElement;
    expect(
      within(newerCard).getByRole("button", { name: /edit compensation/i })
    ).toBeInTheDocument();

    // The older card has the warning but NOT Add New Compensation
    // (because it's not the most recent comp)
    const olderHeading = screen.getByText("Older Vet");
    const olderCard = olderHeading.closest(".compensation-card") as HTMLElement;
    expect(
      within(olderCard).getByText(/this entry is over 2 years old/i)
    ).toBeInTheDocument();
    expect(
      within(olderCard).queryByRole("link", {
        name: /add new compensation/i,
      })
    ).not.toBeInTheDocument();
    expect(
      within(olderCard).queryByRole("button", { name: /edit compensation/i })
    ).not.toBeInTheDocument();
  });
});
