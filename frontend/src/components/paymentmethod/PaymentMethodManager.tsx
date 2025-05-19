import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { createCustomerPortalSession } from "../../queries/stripeQueries";
import { useSnackbar } from "../../context/SnackbarContext";
import PaymentIcon from "@mui/icons-material/Payment";
import "./PaymentMethodManager.css";

interface PaymentMethodManagerProps {
  jobId: string;
}

const PaymentMethodManager = ({ jobId }: PaymentMethodManagerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { openSnackbar } = useSnackbar();

  const portalMutation = useMutation({
    mutationFn: createCustomerPortalSession,
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      openSnackbar(error.message || "Failed to open customer portal", "error");
      setDialogOpen(false);
    },
  });

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleManagePayment = () => {
    portalMutation.mutate(jobId);
  };

  return (
    <div className="payment-method-container">
      {/* UNCOMMENT THIS WHEN IMPLEMENTING PAYMENTS */}
      {/* <Button
        variant="outlined"
        startIcon={<PaymentIcon />}
        onClick={handleOpenDialog}
        className="payment-method-button">
        Manage Payment Methods
      </Button> */}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="payment-dialog-title">
        <DialogTitle id="payment-dialog-title">
          Manage Subscription & Payment Methods
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You'll be redirected to Stripe's secure customer portal where you
            can:
          </Typography>
          <ul className="payment-features-list">
            <li>Update your payment method</li>
            <li>View your payment history</li>
            <li>Download receipts and invoices</li>
            <li>Update your billing information</li>
            <li>Cancel your subscription</li>
          </ul>
          <Typography variant="body2" color="textSecondary">
            Note: Canceling your subscription will remove your job posting from
            veterinarycomp.com.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleManagePayment}
            color="primary"
            variant="contained"
            disabled={portalMutation.isPending}>
            {portalMutation.isPending ? "Redirecting..." : "Continue to Stripe"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PaymentMethodManager;
