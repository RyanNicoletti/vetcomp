import { useState } from "react";
import {
  Typography,
  Button,
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsersCompensation,
  uploadVerificationDocument,
} from "../../queries/compensationQueries";
import {
  getUserJobs,
  deleteJobPost,
  updateApplicationStatus,
  getApplicationsForJob,
} from "../../queries/jobQueries";
import { Link } from "react-router-dom";
import "./Profile.css";
import {
  formatNullableMoneyValue,
  moneyFormatter,
} from "../../utils/moneyFormatter";
import { ICompensation, JobRecord } from "../../../../shared-types/types";
import { useSnackbar } from "../../context/SnackbarContext";
import { format } from "date-fns";

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

  if (isCompensationsLoading || isJobsLoading) return <div>Loading...</div>;
  if (isCompensationsError || isJobsError)
    return <div>Error loading profile data</div>;

  const hasNoData =
    (!compensations || compensations.length === 0) &&
    (!jobs || jobs.length === 0);

  return (
    <div className="profile-container">
      <div className="construction-message">
        <Typography variant="h6">
          Welcome! Veterinarycomp.com is still growing. Once we accumulate
          sufficient data, this page will show how your compensation compares to
          others with similar experience and location.
        </Typography>
      </div>

      {compensations && compensations.length > 0 && (
        <>
          <Typography variant="h4" className="page-title">
            My Compensations
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
                    <span className="label">Title:</span>
                    <span className="value">{comp.title}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">
                      {comp.is_specialist
                        ? "Specialization:"
                        : "Practice Type:"}
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
                <div className="verification-section">
                  {!comp.is_verified && comp.needs_review && (
                    <div>Verification pending review...</div>
                  )}
                  {!comp.is_verified && (
                    <div>
                      <Typography
                        variant="h6"
                        className="verify-header"
                        style={{
                          marginTop: "20px",
                          textAlign: "center",
                        }}>
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
        <>
          <Typography
            variant="h4"
            className="page-title"
            style={{ marginTop: "2rem" }}>
            My Job Posts
          </Typography>
          <div className="jobs-grid">
            {jobs.map((job: JobRecord) => (
              <div key={job.id} className="job-card">
                <Typography variant="h5" className="company">
                  {job.title}
                </Typography>
                <Typography className="location">{job.company}</Typography>
                <div className="job-details">
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span className="value">{job.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className="value">{job.status}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Salary Range:</span>
                    <span className="value">
                      {moneyFormatter.format(job.salary_min)} -{" "}
                      {moneyFormatter.format(job.salary_max)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Type:</span>
                    <span className="value">{job.type}</span>
                  </div>
                </div>

                <Typography variant="h6" className="applications-title">
                  Applicants:
                </Typography>
                <JobApplications jobId={job.id} />

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleCancelJob(job)}
                  className="cancel-button"
                  fullWidth>
                  Cancel Subscription
                </Button>
              </div>
            ))}
          </div>
        </>
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

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  resume_url?: string;
  status: "pending" | "viewed" | "contacted";
  created_at: string;
}

const JobApplications = ({ jobId }: { jobId: string }) => {
  const { openSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["jobApplications", jobId],
    queryFn: () => getApplicationsForJob(jobId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: string;
    }) => updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications", jobId] });
      openSnackbar("Application status updated successfully", "success");
    },
    onError: () => {
      openSnackbar("Failed to update application status", "error");
    },
  });

  if (isLoading) return <Typography>Loading applications...</Typography>;

  if (!applications?.length) {
    return (
      <Typography className="no-applications">
        No applications received yet
      </Typography>
    );
  }

  return (
    <div className="applications-container">
      {applications.map((application: Application) => (
        <div key={application.id} className="application-card">
          <div className="application-header">
            <Typography variant="h6">{application.full_name}</Typography>
            <Typography variant="caption">
              Applied {format(new Date(application.created_at), "MMM d, yyyy")}
            </Typography>
          </div>

          <div className="application-content">
            <div className="application-info">
              <Typography>
                <strong>Email:</strong> {application.email}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {application.phone_number}
              </Typography>
              {application.resume_url && (
                <a
                  href={application.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resume-link">
                  View Resume
                </a>
              )}
            </div>

            <FormControl size="small" className="status-select">
              <InputLabel>Status</InputLabel>
              <Select
                value={application.status}
                label="Status"
                onChange={(e) =>
                  updateStatusMutation.mutate({
                    applicationId: application.id,
                    status: e.target.value,
                  })
                }>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="viewed">Viewed</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      ))}
    </div>
  );
};
