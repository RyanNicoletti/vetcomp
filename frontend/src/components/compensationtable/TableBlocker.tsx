import { Box, Button, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import "./TableBlocker.css";

const TableBlocker = ({ onClose }) => {
  const handleNavigation = () => {
    window.scrollTo(0, 0);
  };
  return (
    <Box className="table-blocker-container">
      <Box className="blocker-content">
        <Typography variant="h5" className="blocker-title">
          Want to see more salary data?
        </Typography>

        <NavLink to="/addcomp" className="blocker-btn-link blocker-description">
          <Button
            variant="contained"
            color="inherit"
            className="blocker-contribute-btn"
            onClick={handleNavigation}>
            Contribute to salary transparency in vet med by sharing your own
            salary data
          </Button>
        </NavLink>
        <Button
          onClick={onClose}
          color="inherit"
          className="blocker-already-btn">
          I've already contributed
        </Button>
      </Box>
    </Box>
  );
};

export default TableBlocker;
