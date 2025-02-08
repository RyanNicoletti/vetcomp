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
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { formatDistance } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JobCard.css";
import { moneyFormatter } from "../../utils/moneyFormatter";
import { JobRecord } from "../../../../shared-types/types";

interface JobCardProps {
  job: JobRecord;
}

const JobCard = ({ job }: JobCardProps) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const daysAgo = formatDistance(new Date(job.created_at!), new Date(), {
    addSuffix: true,
  });

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.application_method === "external" && job.application_url) {
      window.location.href = job.application_url;
    } else {
      navigate(`/jobs/${job.id}/apply`);
    }
  };

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
              onClick={handleApplyClick}>
              Apply Now
            </Button>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default JobCard;
