import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
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
} from "@mui/material";
import { PricingOption, PRICING_OPTIONS } from "./types/jobTypes";
import "./JobPaymentPage.css";

const stripePromise = loadStripe("");

const JobPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>(
    PRICING_OPTIONS[0].id
  );
  const jobData = location.state?.jobData;

  useEffect(() => {
    if (!jobData) {
      navigate("/jobs/post");
    }
  }, [jobData, navigate]);

  const handlePaymentSubmit = async () => {
    const stripe = await stripePromise;
    if (!stripe) return;

    const selectedPricing = PRICING_OPTIONS.find(
      (option) => option.id === selectedOption
    );

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/payments/create-checkout`,
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

      const { sessionId } = await response.json();

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error("Error:", error);
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
    }
  };

  const getOptionCard = (option: PricingOption) => (
    <Card
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
      <Typography variant="h4" gutterBottom>
        Select Posting Duration
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Choose how long you'd like your job posting to be active
      </Typography>

      <Box className="pricing-section">
        <RadioGroup
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}>
          {PRICING_OPTIONS.map((option) => getOptionCard(option))}
        </RadioGroup>
      </Box>

      <Divider className="payment-divider" />

      <Box className="payment-summary">
        <Typography variant="h6">Order Summary</Typography>
        <Box className="summary-details">
          <Typography>Job Posting Duration:</Typography>
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

      <Box className="payment-actions">
        <Button
          variant="outlined"
          onClick={() => navigate("/jobs/post")}
          className="back-button">
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handlePaymentSubmit}
          className="pay-button">
          Proceed to Payment
        </Button>
      </Box>
    </Container>
  );
};

export default JobPaymentPage;
