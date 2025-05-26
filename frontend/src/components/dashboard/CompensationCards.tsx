import { useState } from "react";
import { Typography, Button, Input, Box, Paper } from "@mui/material";
import { useMutation, QueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { uploadVerificationDocument } from "../../queries/compensationQueries";
import { ICompensation } from "../../../../shared-types/types";
import {
  formatNullableMoneyValue,
  moneyFormatter,
} from "../../utils/moneyFormatter";
import "./CompensationCards.css";

interface CompensationCardsProps {
  compensations: ICompensation[];
  queryClient: QueryClient;
  openSnackbar: (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => void;
}

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

  const handleUploadVerification = (compId: string) => {
    const file = selectedFiles[compId];
    if (file) {
      setUploadingCompId(compId);
      uploadVerificationMutation.mutate({ compId, file });
    }
  };

  // Function to check if a compensation entry is older than a year
  const isOlderThanOneYear = (date: Date | undefined): boolean => {
    if (!date) return false;

    const createdAt = new Date(date);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return createdAt < oneYearAgo;
  };

  return (
    <div className="compensation-cards-section">
      <div className="section-header">
        <Typography variant="h5" className="page-title">
          Your Compensation Data
        </Typography>
      </div>

      <div className="compensations-grid">
        {compensations.map((comp: ICompensation) => (
          <div key={comp.id} className="comp-card">
            <Typography variant="h5" className="company">
              {comp.company}
            </Typography>
            <Typography className="location">{comp.location}</Typography>
            <div className="comp-details">
              <div className="detail-item">
                <div className="label">Title:</div>
                <div className="value">{comp.title}</div>
              </div>
              <div className="detail-item">
                <div className="label">
                  {comp.is_specialist ? "Specialization:" : "Practice Type:"}
                </div>
                <div className="value">
                  {comp.is_specialist
                    ? comp.specialization
                    : comp.type_of_practice}
                </div>
              </div>
              <div className="detail-item">
                <div className="label">Years of Experience:</div>
                <div className="value">{comp.years_of_experience}</div>
              </div>
              {comp.is_practice_owner && (
                <>
                  <div className="detail-item">
                    <div className="label">Practice Owner:</div>
                    <div className="value">Yes</div>
                  </div>
                  {comp.practice_description && (
                    <div className="detail-item">
                      <div className="label">Practice Details:</div>
                      <div className="value">{comp.practice_description}</div>
                    </div>
                  )}
                </>
              )}
              {comp.is_traveling && (
                <div className="detail-item">
                  <div className="label">Work Type:</div>
                  <div className="value">Traveling (multiple locations)</div>
                </div>
              )}
              {comp.payment_frequency === "annually" && (
                <div className="detail-item">
                  <div className="label">Total Compensation:</div>
                  <div className="value">
                    {moneyFormatter.format(comp.total_compensation!)}
                  </div>
                </div>
              )}
              <div className="detail-item">
                <div className="label">
                  {comp.payment_frequency === "hourly"
                    ? "Hourly Rate:"
                    : "Base Salary:"}
                </div>
                <div className="value">
                  {comp.payment_frequency === "hourly"
                    ? moneyFormatter.format(comp.hourly_rate!)
                    : moneyFormatter.format(comp.base_salary!)}
                </div>
              </div>
              {comp.average_annual_production && (
                <div className="detail-item">
                  <div className="label">Avg. Annual Production:</div>
                  <div className="value">
                    {formatNullableMoneyValue(comp.average_annual_production) ??
                      "not provided"}
                  </div>
                </div>
              )}
              {comp.sign_on_bonus && (
                <div className="detail-item">
                  <div className="label">Sign-on Bonus:</div>
                  <div className="value">
                    {formatNullableMoneyValue(comp.sign_on_bonus) ??
                      "not provided"}
                  </div>
                </div>
              )}
              {comp.percent_production && (
                <div className="detail-item">
                  <div className="label">% Production:</div>
                  <div className="value">{comp.percent_production}%</div>
                </div>
              )}
              {comp.gender && (
                <div className="detail-item">
                  <div className="label">Gender:</div>
                  <div className="value">{comp.gender}</div>
                </div>
              )}
              {comp.number_of_veterinarians && (
                <div className="detail-item">
                  <div className="label">Number of Veterinarians:</div>
                  <div className="value">{comp.number_of_veterinarians}</div>
                </div>
              )}
              {comp.days_worked_per_week && (
                <div className="detail-item">
                  <div className="label">Days Worked Per Week:</div>
                  <div className="value">{comp.days_worked_per_week}</div>
                </div>
              )}
              <div className="detail-item">
                <div className="label">Date Added:</div>
                <div className="value">
                  {comp.created_at
                    ? new Date(comp.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </div>
              </div>
            </div>

            {isOlderThanOneYear(comp.created_at) && (
              <Box className="comp-reminder">
                <Typography variant="body2">
                  It's been over a year since you submitted this compensation
                  data. If your details have changed, please consider submitting
                  updated information.
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
                  <Typography component="p">
                    Upload an offer letter or pay stub to have this compensation
                    verified.
                  </Typography>
                  <Input
                    type="file"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFileChange(e, comp.id)
                    }
                    fullWidth
                    disableUnderline
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUploadVerification(comp.id)}
                    disabled={
                      !selectedFiles[comp.id] || uploadingCompId === comp.id
                    }
                    fullWidth
                    style={{ marginTop: "10px" }}>
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
        <Box textAlign="center" padding={3}>
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
