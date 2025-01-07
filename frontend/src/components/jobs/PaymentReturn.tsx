import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Typography, CircularProgress, Alert } from "@mui/material";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setError("No session ID found");
      return;
    }

    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/stripe/session-status?session_id=${sessionId}`,
          { credentials: "include" }
        );

        if (!response.ok) throw new Error("Failed to fetch session status");

        const { status } = await response.json();
        setStatus(status);

        if (status === "complete") {
          // Redirect to success page after a brief delay
          setTimeout(() => {
            navigate("/jobs/success");
          }, 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchStatus();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4, textAlign: "center" }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>
        {status === "complete"
          ? "Payment successful! Redirecting..."
          : "Processing your payment..."}
      </Typography>
    </Container>
  );
};

export default PaymentReturn;
