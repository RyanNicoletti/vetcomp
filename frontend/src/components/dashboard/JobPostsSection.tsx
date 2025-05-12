import { useState } from "react";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useMutation, QueryClient } from "@tanstack/react-query";
import { deleteJobPost } from "../../queries/jobQueries";
import { moneyFormatter } from "../../utils/moneyFormatter";
import { JobRecord } from "../../../../shared-types/types";
import JobApplications from "../dashboard/JobApplications";
import PaymentMethodManager from "../paymentmethod/PaymentMethodManager";

interface JobPostsSectionProps {
  jobs: JobRecord[];
  queryClient: QueryClient;
  openSnackbar: (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => void;
}

const JobPostsSection: React.FC<JobPostsSectionProps> = ({
  jobs,
  queryClient,
  openSnackbar,
}) => {
  const [selectedJob, setSelectedJob] = useState<JobRecord | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const handleCancelJob = (job: JobRecord) => {
    setSelectedJob(job);
    setShowConfirmDialog(true);
  };

  const confirmCancel = () => {
    if (selectedJob) {
      deleteJobMutation.mutate(selectedJob.id);
    }
  };

  return (
    <div className="job-posts-container">
      <Typography variant="h5" className="page-title">
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

export default JobPostsSection;
