import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import { formatDistance } from "date-fns";
import "./JobCard.css";
import { moneyFormatter } from "../../utils/moneyFormatter";
import { JobRecord } from "../../../../shared-types/types";

interface JobCardProps {
  job: JobRecord;
  isSelected?: boolean;
  onSelect: () => void;
}

const JobCard = ({ job, isSelected = false, onSelect }: JobCardProps) => {
  const daysAgo = formatDistance(new Date(job.created_at!), new Date(), {
    addSuffix: true,
  });

  return (
    <Card
      className={`job-card ${isSelected ? "job-card-selected" : ""}`}
      onClick={onSelect}>
      <CardContent>
        <Box className="job-card-header">
          <Box className="job-main-info">
            <Typography variant="h6" className="job-title">
              {job.title}
            </Typography>
            <Typography
              variant="subtitle1"
              color="primary"
              className="job-company">
              {job.company}
            </Typography>
          </Box>
          <Box className="job-card-right">
            <Box className="job-salary">
              <Typography variant="body1" fontWeight="medium">
                {moneyFormatter.format(job.salary_min)} -{" "}
                {moneyFormatter.format(job.salary_max)}
              </Typography>
              {job.sign_on_bonus && (
                <Chip
                  label={`Sign-on: ${moneyFormatter.format(job.sign_on_bonus)}`}
                  color="success"
                  size="small"
                  className="job-bonus"
                />
              )}
            </Box>
          </Box>
        </Box>
        <Box className="job-meta">
          <Box className="job-meta-item">
            <LocationOnIcon fontSize="small" />
            <Typography variant="body2">{job.location}</Typography>
          </Box>
          <Box className="job-meta-item">
            <WorkIcon fontSize="small" />
            <Typography variant="body2">{job.type}</Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            className="job-posted">
            Posted {daysAgo}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default JobCard;
