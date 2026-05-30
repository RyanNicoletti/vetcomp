import { useState } from "react";
import {
  Typography,
  Button,
  Input,
  Box,
  Paper,
  Card,
  CardContent,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useMutation, useQuery, QueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { uploadVerificationDocument } from "../../queries/compensationQueries";
import { getSalaryComparison } from "../../queries/salaryComparisonQueries";
import { ICompensation } from "../../../../shared-types/types";
import {
  formatNullableMoneyValue,
  moneyFormatter,
} from "../../utils/moneyFormatter";
import SalaryComparison from "../salarycomparison/SalaryComparison";
import "./CompensationCards.css";

interface CompensationCardsProps {
  compensations: ICompensation[];
  queryClient: QueryClient;
  openSnackbar: (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => void;
}

const SalaryComparisonSection = ({
  hasApprovedCompensation,
  approvedCompensations,
}: {
  hasApprovedCompensation: boolean;
  approvedCompensations: ICompensation[];
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedCompensationId, setSelectedCompensationId] =
    useState<string>("");

  const {
    data: comparisonData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["salaryComparison", selectedCompensationId],
    queryFn: () => getSalaryComparison(selectedCompensationId),
    enabled: showComparison && !!selectedCompensationId,
    staleTime: 5 * 60 * 1000,
  });

  const handleCompareClick = () => {
    if (approvedCompensations.length === 1) {
      setSelectedCompensationId(approvedCompensations[0].id);
    } else if (!selectedCompensationId && approvedCompensations.length > 1) {
      setSelectedCompensationId(approvedCompensations[0].id);
    }

    setShowComparison(true);
  };

  const handleHideComparison = () => {
    setShowComparison(false);
  };

  const handleCompensationChange = (compId: string) => {
    setSelectedCompensationId(compId);
  };

  if (!hasApprovedCompensation) {
    return null;
  }

  if (showComparison) {
    if (isLoading) {
      return null;
    }

    if (isError) {
      return (
        <Card className="salary-comparison-error-card" sx={{ mb: 3 }}>
          <CardContent>
            <Alert severity="error">
              <Typography variant="h6">
                Unable to Generate Comparison
              </Typography>
              <Typography>
                {(error as any)?.message ||
                  "Please ensure you have submitted compensation data with your account to use this feature."}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  onClick={() => setShowComparison(false)}
                  variant="outlined"
                  size="small">
                  Try Again
                </Button>
              </Box>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    if (comparisonData) {
      return (
        <Box className="salary-comparison-results" sx={{ mb: 3 }}>
          {approvedCompensations.length > 1 && (
            <Box sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Compensation</InputLabel>
                <Select
                  value={selectedCompensationId}
                  label="Select Compensation"
                  onChange={(e) => handleCompensationChange(e.target.value)}>
                  {approvedCompensations.map((comp) => (
                    <MenuItem key={comp.id} value={comp.id}>
                      {comp.title} - {comp.company}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          <SalaryComparison embedded compensationId={selectedCompensationId} />
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              onClick={handleHideComparison}
              variant="outlined"
              size="small">
              Hide Comparison
            </Button>
          </Box>
        </Box>
      );
    }
  }

  // Always show simple button when not showing comparison
  return (
    <Box sx={{ mb: 3, textAlign: "center" }}>
      <Button
        onClick={handleCompareClick}
        variant="contained"
        size="medium"
        sx={{
          bgcolor: "#667eea",
          color: "white",
          "&:hover": {
            bgcolor: "#5a6fd8",
          },
          fontWeight: "bold",
        }}>
        Show Salary Comparison
      </Button>
    </Box>
  );
};

const CompensationCards: React.FC<CompensationCardsProps> = ({
  compensations,
  queryClient,
  openSnackbar,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, File | null>
  >({});
  const [uploadingCompId, setUploadingCompId] = useState<string | null>(null);

  const uploadVerificationMutation = useMutation({
    mutationFn: uploadVerificationDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompensations"] });
      setUploadingCompId(null);
      openSnackbar("Verification document uploaded successfully", "success");
    },
    onError: () => {
      openSnackbar("Failed to upload document", "error");
      setUploadingCompId(null);
    },
  });

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    compId: string
  ) => {
    const file = event.target.files?.[0] || null;
    setSelectedFiles((prev) => ({ ...prev, [compId]: file }));
  };

  const handleUploadVerification = async (compId: string) => {
    const file = selectedFiles[compId];
    if (!file) return;

    setUploadingCompId(compId);
    uploadVerificationMutation.mutate({ compId, file });
  };

  const hasApprovedCompensation = compensations.some(
    (comp) => comp.is_approved
  );

  const approvedCompensations = compensations.filter(
    (comp) => comp.is_approved
  );

  const shouldShowReminder = () => {
    if (!compensations || compensations.length === 0) {
      return false;
    }
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const allEntriesOld = compensations.every((comp) => {
      return new Date(comp.created_at!) < oneYearAgo;
    });

    return allEntriesOld;
  };

  return (
    <div className="compensation-cards-container">
      <Typography variant="h5" gutterBottom>
        Your Compensation Information
      </Typography>

      <SalaryComparisonSection
        hasApprovedCompensation={hasApprovedCompensation}
        approvedCompensations={approvedCompensations}
      />

      <div className="compensation-cards">
        {compensations.map((comp) => (
          <div key={comp.id} className="compensation-card">
            <div className="comp-header">
              <Typography variant="h6">{comp.title}</Typography>
              <Typography variant="body1">{comp.company}</Typography>
              <Typography variant="body2" color="textSecondary">
                {comp.location}
              </Typography>
            </div>

            <div className="comp-details">
              <Typography variant="body2">
                <strong>Practice Type:</strong> {comp.type_of_practice || "N/A"}
              </Typography>
              {comp.is_specialist && (
                <Typography variant="body2">
                  <strong>Specialization:</strong> {comp.specialization}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Years of Experience:</strong> {comp.years_of_experience}
              </Typography>
              {comp.payment_frequency === "annually" ? (
                <Typography variant="body2">
                  <strong>Base Salary:</strong>{" "}
                  {formatNullableMoneyValue(comp.base_salary)}
                </Typography>
              ) : (
                <Typography variant="body2">
                  <strong>Hourly Rate:</strong>{" "}
                  {formatNullableMoneyValue(comp.hourly_rate)}
                </Typography>
              )}
              {comp.sign_on_bonus && (
                <Typography variant="body2">
                  <strong>Sign-on Bonus:</strong>{" "}
                  {moneyFormatter.format(comp.sign_on_bonus)}
                </Typography>
              )}
              {comp.total_compensation && (
                <Typography variant="body2">
                  <strong>Total Compensation:</strong>{" "}
                  {moneyFormatter.format(comp.total_compensation)}
                </Typography>
              )}
            </div>

            {shouldShowReminder() && (
              <Box
                className="update-reminder"
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "#fff3cd",
                  borderRadius: 1,
                }}>
                <Typography variant="body2" color="#856404">
                  Your compensation data is over a year old. If your details
                  have changed, please consider submitting updated information.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/addcomp"
                  variant="outlined"
                  color="primary"
                  size="small"
                  className="add-new-comp-btn">
                  Add Updated Compensation
                </Button>
              </Box>
            )}

            <div className="verification-section">
              {!comp.is_verified && comp.needs_review && (
                <div>Verification pending review...</div>
              )}
              {!comp.is_verified && !comp.needs_review && (
                <div>
                  <Typography variant="h6" className="verify-header">
                    Verify Compensation
                  </Typography>
                  <Typography component="p" className="verify-description">
                    Upload verification document (offer letter or pay stub).
                  </Typography>
                  <Input
                    type="file"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFileChange(e, comp.id)
                    }
                    disableUnderline
                    sx={{ width: "fit-content", maxWidth: "300px", mb: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUploadVerification(comp.id)}
                    disabled={
                      !selectedFiles[comp.id] || uploadingCompId === comp.id
                    }
                    sx={{
                      width: "fit-content",
                      maxWidth: "300px",
                      display: "block",
                    }}>
                    {uploadingCompId === comp.id
                      ? "Uploading..."
                      : "Upload Verification"}
                  </Button>
                </div>
              )}
              {comp.is_verified && <div className="verified">✓ Verified</div>}
            </div>
          </div>
        ))}
      </div>

      {compensations.length === 0 && (
        <Box sx={{ textAlign: "center", padding: 3 }}>
          <Paper elevation={2} className="dashboard-section empty-section">
            <Typography variant="h6">
              See how you stack up against others!
            </Typography>
            <Typography variant="body1">
              Add your compensation information to see how you compare to others
              based on years of experience and location.
            </Typography>
          </Paper>

          <Button
            component={RouterLink}
            to="/addcomp"
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}>
            Add Your Compensation
          </Button>
        </Box>
      )}
    </div>
  );
};

export default CompensationCards;
