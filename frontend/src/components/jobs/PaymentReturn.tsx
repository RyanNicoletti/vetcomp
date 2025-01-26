import { useSearchParams, Navigate } from "react-router-dom";
import { Container, Typography, CircularProgress, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchSession } from "../../queries/stripeQueries";
import "./PaymentReturn.css";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sessionStatus", sessionId],
    queryFn: () => fetchSession(sessionId),
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <Container className="payment-return-container">
        <div className="payment-return-loading">
          <CircularProgress />
          <Typography>Checking payment status...</Typography>
        </div>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="payment-return-container">
        <div className="payment-return-error">
          <Typography color="error">
            An unexpected error occurred, your payment was not processed. Please
            try again later or reach out to support at{" "}
            <a href="mailto:support@veterinarycomp.com">
              support@veterinarycomp.com
            </a>
          </Typography>
          <Button
            variant="contained"
            href="/jobs"
            className="payment-return-button">
            Return to Jobs
          </Button>
        </div>
      </Container>
    );
  }

  if (data?.payment_status === "unpaid") {
    return <Navigate to="/jobs/payment" />;
  }

  if (data?.payment_status === "paid") {
    return (
      <Container className="payment-return-container">
        <div className="payment-return-success">
          <Typography variant="h4" className="payment-return-title">
            Payment Successful!
          </Typography>
          <Typography className="payment-return-message">
            We appreciate your business!{" "}
            {data.customer_email &&
              `A confirmation email will be sent to ${data.customer_email}.`}
          </Typography>
          <Typography className="payment-return-support">
            If you have any questions, please email{" "}
            <a href="mailto:support@veterinarycomp.com">
              support@veterinarycomp.com
            </a>
          </Typography>
          <Button
            variant="contained"
            href="/jobs"
            className="payment-return-button">
            View Job Listings
          </Button>
        </div>
      </Container>
    );
  }

  return null;
};

export default PaymentReturn;
