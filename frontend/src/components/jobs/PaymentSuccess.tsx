import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Button,
  Alert,
} from "@mui/material";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completePayment = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setError("Invalid session ID");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/stripe/success?session_id=${sessionId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to complete payment");
        }

        const data = await response.json();

        setIsLoading(false);
      } catch (err) {
        console.error("Error completing payment:", err);
        setError("Failed to complete payment. Please contact support.");
        setIsLoading(false);
      }
    };

    completePayment();
  }, [searchParams]);

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", py: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Processing your payment...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/jobs")} fullWidth>
          Return to Jobs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h4" sx={{ mt: 2 }}>
        Payment Successful!
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Your job posting has been created and is now live.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={() => navigate("/jobs")} fullWidth>
          View Job Listings
        </Button>
      </Box>
    </Container>
  );
};

export default PaymentSuccess;
