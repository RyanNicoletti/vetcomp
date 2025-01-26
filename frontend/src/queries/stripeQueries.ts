import { JobFormData } from "../../../shared-types/types";

interface CreateCheckoutSessionParams {
  jobData: JobFormData;
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
    throw new Error(
      data.error?.message || data.message || "Failed to create checkout session"
    );
  }

  return data;
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
