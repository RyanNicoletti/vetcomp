import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllJobsAdmin, deleteJobById } from "../../queries/adminQueries";
import { useSnackbar } from "../../context/SnackbarContext";
import { format } from "date-fns";
import { moneyFormatter } from "../../utils/moneyFormatter";
import "./AdminJobsTable.css";

interface JobWithUser {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  practice_type: string;
  salary_min: number;
  salary_max: number;
  experience_min: number;
  experience_max: number;
  description: string;
  requirements: string | null;
  benefits: string | null;
  application_method: string;
  contact_email: string | null;
  application_url: string | null;
  status: string;
  created_at: string;
  user_email: string;
}

const AdminJobsTable = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobWithUser | null>(null);
  const { openSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["adminJobs"],
    queryFn: getAllJobsAdmin,
  });

  const deleteJobMutation = useMutation({
    mutationFn: deleteJobById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminJobs"] });
      openSnackbar("Job deleted successfully", "success");
      setDeleteDialogOpen(false);
      setSelectedJob(null);
    },
    onError: () => {
      openSnackbar("Failed to delete job", "error");
    },
  });

  const handleDeleteClick = (job: JobWithUser) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedJob) {
      deleteJobMutation.mutate(selectedJob.id);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      active: { color: "success" as const, label: "Active" },
      expired: { color: "error" as const, label: "Expired" },
      draft: { color: "warning" as const, label: "Draft" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "default" as const,
      label: status,
    };
    return <Chip color={config.color} label={config.label} size="small" />;
  };

  if (isLoading) {
    return <Typography>Loading jobs...</Typography>;
  }

  return (
    <>
      <div className="admin-jobs-container">
        <Typography variant="h5" className="admin-jobs-title">
          Job Management
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          className="admin-jobs-subtitle">
          Total Jobs: {jobs?.length || 0}
        </Typography>

        <TableContainer
          component={Paper}
          className="admin-jobs-table-container">
          <Table>
            <TableHead className="admin-jobs-header">
              <TableRow>
                <TableCell>Job Details</TableCell>
                <TableCell>Company & Location</TableCell>
                <TableCell>Salary Range</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Posted Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs?.map((job) => (
                <TableRow key={job.id} className="admin-jobs-row">
                  <TableCell>
                    <div>
                      <Typography variant="subtitle2" className="job-title">
                        {job.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {job.practice_type} • {job.type}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Typography variant="body2">{job.company}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {job.location}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {moneyFormatter.format(job.salary_min)} -{" "}
                      {moneyFormatter.format(job.salary_max)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.experience_min}-{job.experience_max} years
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Typography variant="body2">{job.user_email}</Typography>
                      {job.application_method === "email" &&
                        job.contact_email && (
                          <Typography variant="caption" color="textSecondary">
                            {job.contact_email}
                          </Typography>
                        )}
                      {job.application_method === "external" &&
                        job.application_url && (
                          <Typography variant="caption" color="textSecondary">
                            External Application
                          </Typography>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusChip(job.status)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(job.created_at), "MMM dd, yyyy")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteClick(job)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Job</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the job "{selectedJob?.title}" at{" "}
            {selectedJob?.company}? This action cannot be undone and will also
            delete all associated applications.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminJobsTable;
