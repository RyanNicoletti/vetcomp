import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery } from "@tanstack/react-query";
import { getJobById } from "../../queries/jobQueries";
import { moneyFormatter } from "../../utils/moneyFormatter";

interface JobDetailsModalProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
}

const JobDetailsModal = ({ jobId, open, onClose }: JobDetailsModalProps) => {
  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJobById(jobId),
    enabled: open && !!jobId,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Job Details</Typography>
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Typography color="error" align="center">
            Failed to load job details
          </Typography>
        )}

        {job && (
          <Box>
            <Typography variant="h4" gutterBottom>
              {job.title}
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              {job.company}
            </Typography>
            <Typography variant="h6" gutterBottom>
              {job.location}
            </Typography>

            <Box display="flex" gap={1} my={2}>
              <Chip label={job.type} size="small" />
              <Chip label={job.practice_type} size="small" color="secondary" />
            </Box>

            <Typography variant="body1" gutterBottom>
              <strong>Salary:</strong> {moneyFormatter.format(job.salary_min)} -{" "}
              {moneyFormatter.format(job.salary_max)}
            </Typography>

            {job.sign_on_bonus && (
              <Typography variant="body1" gutterBottom>
                <strong>Sign-on Bonus:</strong>{" "}
                {moneyFormatter.format(job.sign_on_bonus)}
              </Typography>
            )}

            {job.experience_min !== undefined &&
              job.experience_max !== undefined && (
                <Typography variant="body1" gutterBottom>
                  <strong>Experience Required:</strong> {job.experience_min} -{" "}
                  {job.experience_max} years
                </Typography>
              )}

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography
                variant="body1"
                sx={{ whiteSpace: "pre-line", mb: 2 }}>
                {job.description}
              </Typography>
            </Box>

            {job.requirements && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Requirements
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: "pre-line", mb: 2 }}>
                  {job.requirements}
                </Typography>
              </Box>
            )}

            {job.benefits && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Benefits
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: "pre-line", mb: 2 }}>
                  {job.benefits}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
