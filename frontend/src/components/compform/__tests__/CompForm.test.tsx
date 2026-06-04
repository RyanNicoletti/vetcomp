import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { CompForm } from "../CompForm";
import { ICompensation } from "../../../../../shared-types/types";

// Mock query modules used by CompForm.
vi.mock("../../../queries/locationQueries", () => ({
  getLocationSuggestions: vi.fn(() => Promise.resolve([])),
}));

vi.mock("../../../queries/compensationQueries", () => ({
  createCompensation: vi.fn(() => new Promise(() => {})),
  updateCompensation: vi.fn(() => new Promise(() => {})),
}));

// Controllable auth mock — tests can flip this value before rendering.
const authState = { isAuthenticated: true };
vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    get isAuthenticated() {
      return authState.isAuthenticated;
    },
    isAdmin: false,
    email: "test@example.com",
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshAuthStatus: vi.fn(),
  }),
}));

vi.mock("../../../context/SnackbarContext", () => ({
  useSnackbar: () => ({
    openSnackbar: vi.fn(),
    closeSnackbar: vi.fn(),
  }),
}));

const baseComp: ICompensation = {
  id: "edit-comp-1",
  user_id: "user-1",
  company: "Existing Vet Clinic",
  location: "Boston, MA",
  title: "Senior Vet",
  is_specialist: false,
  specialization: null,
  type_of_practice: "Small animal",
  is_new_grad: false,
  years_of_experience: 5,
  base_salary: 130000,
  hourly_rate: null,
  payment_frequency: "annually",
  sign_on_bonus: null,
  average_annual_production: null,
  percent_production: null,
  total_compensation: 130000,
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

const renderForm = (existingCompensation?: ICompensation) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CompForm existingCompensation={existingCompensation} />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("CompForm create vs edit mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = true;
  });

  it("shows Submit button in create mode (no existingCompensation)", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: /submit compensation/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /save changes/i })
    ).not.toBeInTheDocument();
  });

  it("shows Save Changes button and pre-fills company in edit mode", () => {
    renderForm(baseComp);
    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /submit compensation/i })
    ).not.toBeInTheDocument();

    // Company input pre-fill: react-hook-form sets defaultValues so the
    // TextField should already have the value.
    const companyInput = screen.getByDisplayValue("Existing Vet Clinic");
    expect(companyInput).toBeInTheDocument();
  });

  it("does NOT render the 'Create Account for Salary Comparison' header in edit mode (even when unauthenticated)", () => {
    // Flip auth off — this proves the gating is `isEditMode` and not just
    // the isAuthenticated branch.
    authState.isAuthenticated = false;
    renderForm(baseComp);
    expect(
      screen.queryByText(/create account for salary comparison/i)
    ).not.toBeInTheDocument();
  });
});
