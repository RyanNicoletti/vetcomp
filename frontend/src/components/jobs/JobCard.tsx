import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import { JobPosting } from "./types/jobTypes";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import { formatDistance } from "date-fns";
import "./JobCard.css";
import { moneyFormatter } from "../../utils/moneyFormatter";

interface JobCardProps {
  job: JobPosting;
}

const JobCard = ({ job }: JobCardProps) => {
  const daysAgo = formatDistance(new Date(job.postedDate), new Date(), {
    addSuffix: true,
  });

  return (
    <Card className="job-card">
      <CardContent>
        <Typography variant="h6" component="h2" className="job-title">
          {job.title}
        </Typography>
        <Typography variant="subtitle1" color="primary" gutterBottom>
          {job.company}
        </Typography>

        <Box className="job-meta">
          <Box className="job-meta-item">
            <LocationOnIcon fontSize="small" />
            <Typography variant="body2">{job.location}</Typography>
          </Box>
          <Box className="job-meta-item">
            <WorkIcon fontSize="small" />
            <Typography variant="body2">{job.type}</Typography>
          </Box>
        </Box>

        <Box className="job-salary">
          <Typography variant="body2" color="text.secondary">
            Salary Range:
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {moneyFormatter.format(job.salaryMin)} -{" "}
            {moneyFormatter.format(job.salaryMax)}
          </Typography>
        </Box>

        {job.signOnBonus && (
          <Chip
            label={`Sign-on Bonus: ${moneyFormatter.format(job.signOnBonus)}`}
            color="success"
            size="small"
            className="job-bonus"
          />
        )}

        <Divider className="job-divider" />

        <Typography
          variant="body2"
          color="text.secondary"
          className="job-description">
          {job.description}
        </Typography>

        <Box className="job-footer">
          <Typography variant="caption" color="text.secondary">
            Posted {daysAgo}
          </Typography>
          <Button variant="contained" color="primary" className="job-apply-btn">
            Apply Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default JobCard;
