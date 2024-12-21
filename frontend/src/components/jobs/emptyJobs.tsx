import { Box, Button, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { motion } from "framer-motion";
import "./EmptyJobsState.css";

interface EmptyJobsStateProps {
  onPostJob: () => void;
}

const EmptyJobsState = ({ onPostJob }: EmptyJobsStateProps) => {
  return (
    <Box className="empty-jobs-container">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="empty-jobs-content">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="empty-jobs-icon-wrapper">
          <img
            src="/src/assets/empty-jobs.svg"
            alt="No jobs found"
            className="empty-jobs-image"
          />
        </motion.div>

        <Typography variant="h5" component="h2" className="empty-jobs-title">
          No Jobs Posted Yet
        </Typography>

        <Typography variant="body1" className="empty-jobs-message">
          Be the first to post a job opportunity for veterinary professionals.
        </Typography>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            onClick={onPostJob}
            startIcon={<AddCircleOutlineIcon />}
            className="empty-jobs-button">
            Post a Job
          </Button>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default EmptyJobsState;
