import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import "./JobPaymentPage.css";
import { createCheckoutSession } from "../../queries/stripeQueries";
import { useMutation } from "@tanstack/react-query";

const stripePromise = loadStripe(`${import.meta.env.VITE_STRIPE_API_KEY}`);

const JobPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const jobData = location.state?.jobData;
  const MONTHLY_PRICE = 99;

  const checkoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
  });

  const handlePaymentSubmit = () => {
    checkoutMutation.mutate({
      jobData,
      pricePerMonth: MONTHLY_PRICE,
    });
  };

  return (
    <Container className="job-payment-page">
      {!clientSecret ? (
        <Box>
          <Card className="job-payment-card">
            <CardContent>
              <Typography
                variant="h4"
                align="center"
                className="job-payment-title">
                Subscription Summary
              </Typography>

              <div className="job-payment-price">
                <Typography className="job-payment-price-amount">
                  ${MONTHLY_PRICE}/month
                </Typography>
                <Typography className="job-payment-price-description">
                  Monthly subscription, cancel anytime
                </Typography>
              </div>

              <Divider className="job-payment-divider" />

              <div className="job-payment-details">
                <div className="job-payment-detail-row">
                  <Typography>Job Title:</Typography>
                  <Typography className="job-payment-detail-value">
                    {jobData.title}
                  </Typography>
                </div>

                <div className="job-payment-detail-row">
                  <Typography>Company:</Typography>
                  <Typography className="job-payment-detail-value">
                    {jobData.company}
                  </Typography>
                </div>

                <div className="job-payment-detail-row">
                  <Typography>Location:</Typography>
                  <Typography className="job-payment-detail-value">
                    {jobData.location}
                  </Typography>
                </div>

                <div className="job-payment-detail-row">
                  <Typography>Practice Type:</Typography>
                  <Typography className="job-payment-detail-value">
                    {jobData.practiceType}
                  </Typography>
                </div>
              </div>

              <div className="job-payment-features">
                <Typography variant="body2" color="text.secondary">
                  Your job post includes:
                </Typography>
                <ul className="job-payment-features-list">
                  <li>Access to applicant management dashboard</li>
                  <li>Email notifications for new applications</li>
                  <li>Edit job posting anytime</li>
                  <li>Cancel subscription anytime</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {checkoutMutation.error && (
            <div className="job-payment-error">
              {checkoutMutation.error instanceof Error
                ? checkoutMutation.error.message
                : "An unexpected error occurred"}
            </div>
          )}

          <div className="job-payment-actions">
            <Button
              variant="outlined"
              onClick={() => navigate("/jobs/post")}
              disabled={checkoutMutation.isPending}
              className="job-payment-button">
              Back
            </Button>

            <Button
              variant="contained"
              onClick={handlePaymentSubmit}
              disabled={checkoutMutation.isPending}
              className="job-payment-button">
              {checkoutMutation.isPending ? (
                <>
                  <CircularProgress size={20} className="job-payment-spinner" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </div>
        </Box>
      ) : (
        <div className="job-payment-checkout">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}
    </Container>
  );
};

export default JobPaymentPage;
