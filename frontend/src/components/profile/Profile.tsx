import { useState } from "react";
import {
  Typography,
  Button,
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsersCompensation,
  uploadVerificationDocument,
} from "../../queries/compensationQueries";
import { getUserJobs, deleteJobPost } from "../../queries/jobQueries";
import { Link } from "react-router-dom";
import {
  formatNullableMoneyValue,
  moneyFormatter,
} from "../../utils/moneyFormatter";
import { ICompensation, JobRecord } from "../../../../shared-types/types";
import { useSnackbar } from "../../context/SnackbarContext";
import JobApplications from "./JobApplications";
import "./Profile.css";
import PaymentMethodManager from "../paymentmethod/PaymentMethodManager";

export const Profile = () => {
  const queryClient = useQueryClient();
  const { openSnackbar } = useSnackbar();
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, File | null>
  >({});
  const [uploadingCompId, setUploadingCompId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobRecord | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {
    data: compensations,
    isLoading: isCompensationsLoading,
    isError: isCompensationsError,
  } = useQuery({
    queryKey: ["userCompensations"],
    queryFn: getUsersCompensation,
  });

  const {
    data: jobs,
    isLoading: isJobsLoading,
    isError: isJobsError,
  } = useQuery({
    queryKey: ["userJobs"],
    queryFn: getUserJobs,
  });

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

  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => deleteJobPost(jobId),
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: ["userJobs"] });
      const previousJobs = queryClient.getQueryData<JobRecord[]>(["userJobs"]);

      if (previousJobs) {
        queryClient.setQueryData<JobRecord[]>(
          ["userJobs"],
          previousJobs.filter((job) => job.id !== jobId)
        );
      }

      return { previousJobs };
    },
    onError: (_err, _, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(["userJobs"], context.previousJobs);
      }
      openSnackbar("Failed to cancel job post", "error");
    },
    onSuccess: () => {
      openSnackbar("Job post cancelled successfully", "success");
      setShowConfirmDialog(false);
    },
  });

  const handleFileChange = (event: any, compId: string) => {
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

  const handleCancelJob = (job: JobRecord) => {
    setSelectedJob(job);
    setShowConfirmDialog(true);
  };

  const confirmCancel = () => {
    if (selectedJob) {
      deleteJobMutation.mutate(selectedJob.id);
    }
  };

  if (isCompensationsLoading || isJobsLoading) {
    return (
      <div className="loading-container">Loading your profile data...</div>
    );
  }

  if (isCompensationsError || isJobsError) {
    return (
      <div className="error-container">
        Error loading profile data. Please try refreshing the page.
      </div>
    );
  }

  const hasNoData =
    (!compensations || compensations.length === 0) &&
    (!jobs || jobs.length === 0);

  return (
    <div className="profile-container">
      {compensations && compensations.length > 0 && (
        <>
          <Typography
            variant="h5"
            className="page-title"
            style={{ fontSize: "1.8rem" }}>
            Compensations
          </Typography>
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
                      {comp.is_specialist
                        ? "Specialization:"
                        : "Practice Type:"}
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
                        {formatNullableMoneyValue(
                          comp.average_annual_production
                        ) ?? "not provided"}
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
                      <div className="value">
                        {comp.number_of_veterinarians}
                      </div>
                    </div>
                  )}
                  {comp.days_worked_per_week && (
                    <div className="detail-item">
                      <div className="label">Days Worked Per Week:</div>
                      <div className="value">{comp.days_worked_per_week}</div>
                    </div>
                  )}
                </div>
                <div className="verification-section">
                  {!comp.is_verified && comp.needs_review && (
                    <div>Verification pending review...</div>
                  )}
                  {!comp.is_verified && (
                    <div>
                      <Typography variant="h6" className="verify-header">
                        Verify Compensation
                      </Typography>
                      <Typography component="p">
                        Upload an offer letter or pay stub to have this
                        compensation verified.
                      </Typography>
                      <Input
                        type="file"
                        onChange={(e) => handleFileChange(e, comp.id)}
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
                  {comp.is_verified && (
                    <div className="verified">✓ Verified</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {jobs && jobs.length > 0 && (
        <div className="job-posts-container">
          <Typography
            variant="h5"
            className="page-title"
            style={{ marginTop: "2rem", fontSize: "1.8rem" }}>
            Job Posts
          </Typography>
          <div className="jobs-grid">
            {jobs.map((job: JobRecord) => (
              <div key={job.id} className="profile-job-card">
                <Typography variant="h5" className="company">
                  {job.title}
                </Typography>
                <Typography className="location">{job.company}</Typography>
                <div className="job-details">
                  <div className="detail-item">
                    <div className="label">Location:</div>
                    <div className="value">{job.location}</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Status:</div>
                    <div className="value">{job.status}</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Salary Range:</div>
                    <div className="value">
                      {moneyFormatter.format(job.salary_min)} -{" "}
                      {moneyFormatter.format(job.salary_max)}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Type:</div>
                    <div className="value">{job.type}</div>
                  </div>
                </div>

                <JobApplications jobId={job.id} />

                <PaymentMethodManager jobId={job.id} />

                <Button
                  variant="outlined"
                  color="error"
                  className="delete-job-button"
                  onClick={() => handleCancelJob(job)}>
                  Delete Job Post
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasNoData && (
        <div className="no-data">
          <Typography variant="h6">
            Your profile is empty. Add compensation information or post a job to
            get started.
          </Typography>
          <div className="action-buttons">
            <Button
              component={Link}
              to="/addcomp"
              variant="contained"
              color="primary"
              className="action-button">
              Add Compensation
            </Button>
            <Button
              component={Link}
              to="/jobs/post"
              variant="contained"
              color="primary"
              className="action-button">
              Post a Job
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Cancel Job Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this job post? This action will also
            cancel your subscription.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            No, Keep It
          </Button>
          <Button onClick={confirmCancel} color="error" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
