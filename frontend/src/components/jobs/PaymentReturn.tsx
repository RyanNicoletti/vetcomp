import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, Container, Typography } from "@mui/material";
import "./PaymentReturn.css";

const PaymentReturn = () => {
  const navigate = useNavigate();

  return (
    <Container className="payment-return-container">
      <div className="payment-return-success">
        <Typography variant="h4" className="payment-return-title">
          Payment processed and job post successfully created!
        </Typography>
        <Typography className="payment-return-message">
          Thank you for posting a job on veterinarycomp.com! A confirmation
          email has been sent to your email address with the details of your
          post and subscription.
        </Typography>
        <Typography className="payment-return-support">
          If you have any questions, please email{" "}
          <a href="mailto:support@veterinarycomp.com">
            support@veterinarycomp.com
          </a>
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/jobs")}
          className="payment-return-button">
          View Job Listings
        </Button>
      </div>
    </Container>
  );
};

export default PaymentReturn;
