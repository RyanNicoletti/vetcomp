import {
  Typography,
  Box,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import "./UserApplications.css";
import { getUserApplications } from "../../queries/jobApplicationQueries";

interface JobApplication {
  id: string;
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  status: string;
  created_at: string;
  resume_url?: string;
}

const UserApplications = () => {
  const {
    data: applications,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userApplications"],
    queryFn: getUserApplications,
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
    return (
      <Box display="flex" justifyContent="center" padding={2}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography color="error">
        Error loading your applications. Please try again later.
      </Typography>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Box textAlign="center" padding={2}>
        <Typography variant="body1" gutterBottom>
          You haven't applied to any jobs yet.
        </Typography>
        <Button
          component={Link}
          to="/jobs"
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}>
          Browse Jobs
        </Button>
      </Box>
    );
  }

  return (
    <Box className="job-applications-container">
      <List>
        {applications.map((application: JobApplication, index: number) => (
          <Box key={application.id}>
            {index > 0 && <Divider />}
            <ListItem
              alignItems="flex-start"
              className="application-item"
              component={Link}
              to={`/jobs/${application.job_id}`}
              sx={{
                textDecoration: "none",
                color: "inherit",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}>
              <ListItemText
                primary={
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center">
                    <Typography variant="subtitle1" fontWeight="medium">
                      {application.job_title}
                    </Typography>
                    <Chip
                      label={application.status}
                      size="small"
                      color={getStatusColor(application.status)}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <BusinessIcon
                        fontSize="small"
                        sx={{ marginRight: 0.5, opacity: 0.7 }}
                      />
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary">
                        {application.company} - {application.location}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <CalendarTodayIcon
                        fontSize="small"
                        sx={{ marginRight: 0.5, opacity: 0.7 }}
                      />
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary">
                        Applied on{" "}
                        {format(
                          new Date(application.created_at),
                          "MMM d, yyyy"
                        )}
                      </Typography>
                    </Box>
                  </>
                }
              />
            </ListItem>
          </Box>
        ))}
      </List>

      <Box textAlign="center" padding={2}>
        <Button
          component={Link}
          to="/jobs"
          variant="outlined"
          color="primary"
          size="small">
          View More Jobs
        </Button>
      </Box>
    </Box>
  );
};

export default UserApplications;
