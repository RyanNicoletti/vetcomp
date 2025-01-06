import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Collapse,
  IconButton,
} from "@mui/material";
import { JobPost } from "./types/jobTypes";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { formatDistance } from "date-fns";
import { useState } from "react";
import "./JobCard.css";
import { moneyFormatter } from "../../utils/moneyFormatter";

interface JobCardProps {
  job: JobPost;
}

const JobCard = ({ job }: JobCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const daysAgo = formatDistance(new Date(job.postedDate), new Date(), {
    addSuffix: true,
  });

  return (
    <Card className="job-card" onClick={() => setExpanded(!expanded)}>
      <CardContent>
        <Box className="job-card-header">
          <Box className="job-main-info">
            <Typography variant="h6" className="job-title">
              {job.title}
            </Typography>
            <Typography variant="subtitle1" color="primary">
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
              <Typography
                variant="body2"
                color="text.secondary"
                className="job-posted">
                Posted {daysAgo}
              </Typography>
            </Box>
          </Box>

          <Box className="job-card-right">
            <Box className="job-salary">
              <Typography variant="body1" fontWeight="medium">
                {moneyFormatter.format(job.salaryMin)} -{" "}
                {moneyFormatter.format(job.salaryMax)}
              </Typography>
              {job.signOnBonus && (
                <Chip
                  label={`Sign-on: ${moneyFormatter.format(job.signOnBonus)}`}
                  color="success"
                  size="small"
                  className="job-bonus"
                />
              )}
            </Box>
            <IconButton
              className={`expand-button ${expanded ? "expanded" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}>
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Divider className="job-divider" />
          <Box className="job-details">
            <Typography variant="body1" className="job-section">
              <strong>Description</strong>
              <p>{job.description}</p>
            </Typography>
            {job.requirements && (
              <Typography variant="body1" className="job-section">
                <strong>Requirements</strong>
                <p>{job.requirements}</p>
              </Typography>
            )}
            {job.benefits && (
              <Typography variant="body1" className="job-section">
                <strong>Benefits</strong>
                <p>{job.benefits}</p>
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              className="job-apply-btn"
              onClick={(e) => {
                e.stopPropagation();
                // Handle apply logic
              }}>
              Apply Now
            </Button>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default JobCard;
