import { Box, Typography } from "@mui/material";
import "./Profile.css";

export const Profile = () => {
  return (
    <Box className="profile-container">
      <Typography variant="h3">My Compensations</Typography>
      <Box className="comp-container"></Box>
    </Box>
  );
};
