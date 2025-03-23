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
  TableSortLabel,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { format } from "date-fns";
import DownloadIcon from "@mui/icons-material/Download";
import EmailIcon from "@mui/icons-material/Email";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getApplicationsForJob,
  updateApplicationStatus,
} from "../../queries/jobQueries";
import { deleteApplication } from "../../queries/jobApplicationQueries";
import { useSnackbar } from "../../context/SnackbarContext";
import "./ApplicationsList.css";
import { Link } from "react-router-dom";

interface ApplicationsListProps {
  jobId: string;
  jobTitle: string;
}

interface UpdateStatusParams {
  applicationId: string;
  status: string;
}

type SortField = "full_name" | "created_at" | "status";
type SortDirection = "asc" | "desc";

const ApplicationsList = ({ jobId, jobTitle }: ApplicationsListProps) => {
  const [sortBy, setSortBy] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { openSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["jobApplications", jobId],
    queryFn: () => getApplicationsForJob(jobId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: UpdateStatusParams) =>
      updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications", jobId] });
      openSnackbar("Application status updated successfully", "success");
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications", jobId] });
      openSnackbar("Application deleted successfully", "success");
      setConfirmDeleteId(null);
    },
    onError: (error) => {
      openSnackbar("Failed to delete application", "error");
      console.error(error);
    },
  });

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const sortedApplications = applications?.slice().sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    switch (sortBy) {
      case "full_name":
        return multiplier * a.full_name.localeCompare(b.full_name);
      case "created_at":
        return (
          multiplier *
          (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        );
      case "status":
        return multiplier * a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "viewed":
        return "primary";
      case "contacted":
        return "success";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return <Typography>Loading applications...</Typography>;
  }

  if (!applications?.length) {
    return (
      <Paper className="empty-state">
        <Typography variant="h6">No applications yet</Typography>
        <Typography variant="body2" color="textSecondary">
          When candidates apply to this position, they will appear here
        </Typography>
      </Paper>
    );
  }

  return (
    <div className="applications-list">
      <Dialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">Delete Application</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this application? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (confirmDeleteId) {
                deleteApplicationMutation.mutate(confirmDeleteId);
              }
            }}
            color="error"
            autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <div className="applications-header-container">
        <Button
          component={Link}
          to="/profile"
          variant="outlined"
          size="small"
          className="back-button"
          startIcon={<ArrowBackIcon />}>
          Back to Profile
        </Button>
        <Typography variant="h5" className="applications-title">
          Applications for {jobTitle}
        </Typography>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "full_name"}
                  direction={sortDirection}
                  onClick={() => handleSort("full_name")}>
                  Applicant
                </TableSortLabel>
              </TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "created_at"}
                  direction={sortDirection}
                  onClick={() => handleSort("created_at")}>
                  Applied
                </TableSortLabel>
              </TableCell>
              <TableCell>Resume</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "status"}
                  direction={sortDirection}
                  onClick={() => handleSort("status")}>
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedApplications?.map((application) => (
              <TableRow key={application.id} className="application-row">
                <TableCell>{application.full_name}</TableCell>
                <TableCell>
                  <div className="contact-info">
                    <div>{application.email}</div>
                    <div>{application.phone_number}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(application.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {application.resume_url ? (
                    <IconButton
                      component="a"
                      href={`${import.meta.env.VITE_API_BASE_URL}${
                        application.resume_url
                      }`}
                      download
                      className="download-button">
                      <DownloadIcon />
                    </IconButton>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No resume
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={application.status}
                    color={getStatusColor(application.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <div className="action-buttons">
                    <IconButton
                      onClick={() =>
                        (window.location.href = `mailto:${application.email}`)
                      }
                      className="email-button">
                      <EmailIcon />
                    </IconButton>
                    {application.status !== "contacted" && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            applicationId: application.id,
                            status: "contacted",
                          })
                        }>
                        Mark Contacted
                      </Button>
                    )}
                    <IconButton
                      onClick={() => setConfirmDeleteId(application.id)}
                      color="error"
                      className="delete-button">
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ApplicationsList;
