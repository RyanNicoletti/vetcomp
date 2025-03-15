import { useNavigate } from "react-router-dom";
import { Button, Container, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "./PaymentReturn.css";

const PaymentReturn = () => {
  const navigate = useNavigate();

  return (
    <Container className="payment-return-container">
      <div className="payment-return-success">
        <Typography variant="h4" className="payment-return-title">
          Payment Successful
        </Typography>
        <CheckCircleIcon className="checkmark-icon" />
        <Typography className="payment-return-message">
          Thank you for posting a job on veterinarycomp.com! A confirmation
          email has been sent with details of your job listing and subscription.
        </Typography>
        <Typography className="payment-return-support">
          For questions related to your job post or subscription, please contact{" "}
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
