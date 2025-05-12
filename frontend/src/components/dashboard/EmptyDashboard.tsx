import { Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const EmptyDashboard: React.FC = () => {
  return (
    <div className="no-data">
      <Typography variant="h6">
        Your dashboard is empty. Add compensation information or post a job to
        get started.
      </Typography>
      <div className="action-buttons">
        <Button
          component={Link}
          to="/addcomp"
          variant="contained"
          color="primary"
          className="action-button">
          Add Compensation
        </Button>
        <Button
          component={Link}
          to="/jobs/post"
          variant="contained"
          color="primary"
          className="action-button">
          Post a Job
        </Button>
      </div>
    </div>
  );
};

export default EmptyDashboard;
