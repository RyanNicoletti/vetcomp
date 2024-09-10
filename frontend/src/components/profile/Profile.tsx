import { useState } from "react";
import { Typography, Button, TextField } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsersCompensation,
  verifyCompensation,
} from "../../queries/compensationQueries";
import { Link } from "react-router-dom";
import "./Profile.css";
import {
  formatNullableMoneyValue,
  moneyFormatter,
} from "../../utils/moneyFormatter";

export const Profile = () => {
  const queryClient = useQueryClient();
  const [verifyingCompId, setVerifyingCompId] = useState<string | null>(null);

  const {
    data: compensations,
    isLoading: isCompensationsLoading,
    isError: isCompensationsError,
  } = useQuery({
    queryKey: ["userCompensations"],
    queryFn: () => getUsersCompensation(),
  });

  const verifyCompensationMutation = useMutation({
    mutationFn: verifyCompensation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompensations"] });
      setVerifyingCompId(null);
    },
  });

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    compId: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      verifyCompensationMutation.mutate({ compId, file });
    }
  };

  if (isCompensationsLoading) return <div>Loading...</div>;
  if (isCompensationsError) return <div>Error loading compensations</div>;

  return (
    <div className="profile-container">
      <div className="construction-message">
        <Typography variant="h6">
          Welcome! Veterinarycomp.com is still growing, once we accumulate a
          sufficient amount data this page will show how your compensation
          compares to others with similar experience/location.
        </Typography>
      </div>

      <Typography variant="h4" className="page-title">
        My Compensations
      </Typography>

      {compensations && compensations.length > 0 ? (
        <div className="compensations-grid">
          {compensations.map((comp: any) => (
            <div key={comp.id} className="comp-card">
              <Typography variant="h5" className="company">
                {comp.company}
              </Typography>
              <Typography className="location">{comp.location}</Typography>
              <div className="comp-details">
                <div className="detail-item">
                  <span className="label">Title:</span>
                  <span className="value">{comp.title}</span>
                </div>
                <div className="detail-item">
                  <span className="label">
                    {comp.is_specialist ? "Specialization:" : "Practice Type:"}
                  </span>
                  <span className="value">
                    {comp.is_specialist
                      ? comp.specialization
                      : comp.type_of_practice}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Years of Experience:</span>
                  <span className="value">{comp.years_of_experience}</span>
                </div>
                {comp.payment_frequency === "annually" && (
                  <div className="detail-item">
                    <span className="label">Total Compensation:</span>
                    <span className="value">
                      {moneyFormatter.format(comp.total_compensation!)}
                    </span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="label">
                    {comp.payment_frequency === "hourly"
                      ? "Hourly Rate:"
                      : "Base Salary:"}
                  </span>
                  <span className="value">
                    {comp.payment_frequency === "hourly"
                      ? moneyFormatter.format(comp.hourly_rate!)
                      : moneyFormatter.format(comp.base_salary!)}
                  </span>
                </div>
                {comp.average_annual_production && (
                  <div className="detail-item">
                    <span className="label">Avg. Annual Production:</span>
                    <span className="value">
                      {formatNullableMoneyValue(
                        comp.average_annual_production
                      ) ?? "not provided"}
                    </span>
                  </div>
                )}
                {comp.sign_on_bonus && (
                  <div className="detail-item">
                    <span className="label">Sign-on Bonus:</span>
                    <span className="value">
                      {formatNullableMoneyValue(comp.sign_on_bonus) ??
                        "not provided"}
                    </span>
                  </div>
                )}
                {comp.percent_production && (
                  <div className="detail-item">
                    <span className="label">% Production:</span>
                    <span className="value">{comp.percent_production}%</span>
                  </div>
                )}
                {comp.gender && (
                  <div className="detail-item">
                    <span className="label">Gender:</span>
                    <span className="value">{comp.gender}</span>
                  </div>
                )}
                {comp.number_of_veterinarians && (
                  <div className="detail-item">
                    <span className="label">Number of Veterinarians:</span>
                    <span className="value">
                      {comp.number_of_veterinarians}
                    </span>
                  </div>
                )}
                {comp.days_worked_per_week && (
                  <div className="detail-item">
                    <span className="label">Days Worked Per Week:</span>
                    <span className="value">{comp.days_worked_per_week}</span>
                  </div>
                )}
              </div>
              {comp.is_verified ? (
                <div className="verified">✓ Verified</div>
              ) : (
                <div className="verification-section">
                  {verifyingCompId === comp.id ? (
                    <TextField
                      type="file"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFileChange(e, comp.id)
                      }
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <Button
                            onClick={() => setVerifyingCompId(null)}
                            size="small"
                            color="secondary">
                            Cancel
                          </Button>
                        ),
                      }}
                    />
                  ) : (
                    <Button
                      variant="outlined"
                      className="verify-button"
                      onClick={() => setVerifyingCompId(comp.id)}
                      disabled={verifyCompensationMutation.isPending}>
                      {verifyCompensationMutation.isPending
                        ? "Verifying..."
                        : "Verify Compensation"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-compensations">
          <Typography variant="h6">
            Looks like there's nothing here. To add your compensation and see
            how it compares to others, fill out the compensation form.
          </Typography>
          <Button
            component={Link}
            to="/addcomp"
            variant="contained"
            color="primary">
            Add Compensation
          </Button>
        </div>
      )}
    </div>
  );
};
