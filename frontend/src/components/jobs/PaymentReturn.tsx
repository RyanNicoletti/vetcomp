import { useNavigate, useLocation } from "react-router-dom";
import { Button, Container, Typography, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "./PaymentReturn.css";

const PaymentReturn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobTitle, company, isPaid = false } = location.state || {};

  return (
    <Container className="payment-return-container">
      <div className="payment-return-success">
        <Typography variant="h4" className="payment-return-title">
          {isPaid ? "Payment Successful" : "Success!"}
        </Typography>
        <CheckCircleIcon className="checkmark-icon" />

        {jobTitle && company && (
          <Typography variant="h6" className="payment-return-subtitle">
            "{jobTitle}" at {company}
          </Typography>
        )}

        <Typography className="payment-return-message">
          Thank you for posting a job ad on veterinarycomp.com! A confirmation
          email has been sent with details of your job listing.
        </Typography>

        <Typography className="payment-return-support">
          We'd love to hear from you, please email us at{" "}
          <a href="mailto:support@veterinarycomp.com">
            support@veterinarycomp.com
          </a>{" "}
          with any feedback about our site
        </Typography>

        <Box className="payment-return-actions">
          <Button
            variant="contained"
            onClick={() => navigate("/jobs")}
            className="payment-return-button">
            View Job Listings
          </Button>
          {!isPaid && (
            <Button
              variant="outlined"
              onClick={() => navigate("/dashboard")}
              className="payment-return-button">
              Manage My Jobs
            </Button>
          )}
        </Box>
      </div>
    </Container>
  );
};

export default PaymentReturn;
