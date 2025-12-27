import { Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const EmptyDashboard: React.FC = () => {
  return (
    <div className="no-data">
      <Typography variant="h6">
        Your dashboard is empty. Add compensation information to get started.
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
      </div>
    </div>
  );
};

export default EmptyDashboard;
