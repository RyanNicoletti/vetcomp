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
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import "./JobPaymentPage.css";
import { PRICING_OPTIONS, PricingOption } from "./types/jobTypes";

const stripePromise = loadStripe(`${import.meta.env.VITE_STRIPE_API_KEY}`);

const JobPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(PRICING_OPTIONS[0].id);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jobData = location.state?.jobData;

  const handlePaymentSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const selectedPricing = PRICING_OPTIONS.find(
        (option) => option.id === selectedOption
      );

      if (!selectedPricing) {
        throw new Error("Invalid pricing option selected");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/stripe/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobData,
            priceOption: selectedPricing,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create checkout session"
        );
      }

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderPricingOption = (option: PricingOption) => (
    <Card
      key={option.id}
      className={`pricing-option ${
        selectedOption === option.id ? "selected" : ""
      }`}
      variant="outlined">
      <CardContent>
        <FormControlLabel
          value={option.id}
          control={<Radio />}
          label={
            <Box className="pricing-option-content">
              <Typography variant="h6">{option.description}</Typography>
              <Typography variant="h5" color="primary">
                ${option.price}
              </Typography>
              {option.savings && (
                <Typography variant="body2" color="success.main">
                  {option.savings}
                </Typography>
              )}
            </Box>
          }
        />
      </CardContent>
    </Card>
  );

  return (
    <Container className="payment-container">
      {!clientSecret ? (
        <Box>
          <Typography variant="h4" gutterBottom>
            Pricing Options
          </Typography>

          <Typography variant="body1" color="text.secondary" gutterBottom>
            Choose how long you'd like your job posting to be active
          </Typography>

          <Box className="pricing-section">
            <RadioGroup
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}>
              {PRICING_OPTIONS.map(renderPricingOption)}
            </RadioGroup>
          </Box>

          <Divider className="payment-divider" />

          <Box className="payment-summary">
            <Typography variant="h6">Order Summary</Typography>

            <Box className="summary-details">
              <Typography>Job Title:</Typography>
              <Typography>{jobData.title}</Typography>
            </Box>

            <Box className="summary-details">
              <Typography>Company:</Typography>
              <Typography>{jobData.company}</Typography>
            </Box>

            <Box className="summary-details">
              <Typography>Duration:</Typography>
              <Typography>
                {
                  PRICING_OPTIONS.find((option) => option.id === selectedOption)
                    ?.months
                }{" "}
                months
              </Typography>
            </Box>

            <Box className="summary-details">
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                $
                {
                  PRICING_OPTIONS.find((option) => option.id === selectedOption)
                    ?.price
                }
              </Typography>
            </Box>
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
              {error}
            </Typography>
          )}

          <Box className="payment-actions">
            <Button
              variant="outlined"
              onClick={() => navigate("/jobs/post")}
              disabled={isLoading}>
              Back
            </Button>

            <Button
              variant="contained"
              onClick={handlePaymentSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </Box>
        </Box>
      ) : (
        <div id="checkout">
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
