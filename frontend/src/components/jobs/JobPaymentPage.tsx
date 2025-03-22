import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import {
  Box,
  Container,
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
  const shouldShowFeatures = jobData.applicationMethod === "email";
  const MONTHLY_PRICE = 45;

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
    <Container className="job-payment-container">
      {!clientSecret ? (
        <Box>
          <div className="job-payment-card">
            <h2 className="job-payment-title">Payment Summary</h2>

            <div className="job-payment-price">
              <span className="job-payment-price-amount">
                ${MONTHLY_PRICE}/month
              </span>
              <span className="job-payment-price-description">
                Monthly subscription, cancel anytime
              </span>
            </div>

            <Divider className="job-payment-divider" />

            <div className="job-payment-content">
              <div className="job-payment-details">
                <div className="job-payment-detail-row">
                  <span>Job Title</span>
                  <span className="job-payment-detail-value">
                    {jobData.title}
                  </span>
                </div>
                <div className="job-payment-detail-row">
                  <span>Hospital Name</span>
                  <span className="job-payment-detail-value">
                    {jobData.company}
                  </span>
                </div>
                <div className="job-payment-detail-row">
                  <span>Location</span>
                  <span className="job-payment-detail-value">
                    {jobData.location}
                  </span>
                </div>
                <div className="job-payment-detail-row">
                  <span>Practice Type</span>
                  <span className="job-payment-detail-value">
                    {jobData.practiceType}
                  </span>
                </div>
              </div>

              {shouldShowFeatures && (
                <div className="job-payment-features">
                  <span className="features-title">
                    Your job post includes:
                  </span>
                  <ul className="job-payment-features-list">
                    <li>Access to applicant management dashboard</li>
                    <li>Email notifications for new applications</li>
                    <li>Edit job posting anytime</li>
                    <li>Cancel subscription anytime</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

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
              disabled={checkoutMutation.isPending}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handlePaymentSubmit}
              disabled={checkoutMutation.isPending}>
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
