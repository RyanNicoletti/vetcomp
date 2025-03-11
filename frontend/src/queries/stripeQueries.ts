import { IJobFormData } from "../../../shared-types/types";

interface CreateCheckoutSessionParams {
  jobData: IJobFormData;
  pricePerMonth: number;
}

interface SessionStatusResponse {
  payment_status: "paid" | "unpaid" | "no_payment_required";
  customer_email: string | null;
  job?: {
    id: string;
    title: string;
    // ... other job fields
  };
}

export const createCheckoutSession = async ({
  jobData,
  pricePerMonth,
}: CreateCheckoutSessionParams) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/stripe/checkout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobData,
        pricePerMonth,
      }),
      credentials: "include",
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to create checkout session");
  }

  return { clientSecret: data.clientSecret };
};

export const fetchSession = async (
  sessionId: string | null
): Promise<SessionStatusResponse> => {
  if (!sessionId) throw new Error("Session ID is required");

  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/stripe/session-status?session_id=${sessionId}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch session status");
  }

  return response.json();
};

export const createCustomerPortalSession = async (
  jobId: string
): Promise<{ url: string }> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/stripe/customer-portal`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobId }),
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Failed to create customer portal session"
    );
  }

  return response.json();
};
