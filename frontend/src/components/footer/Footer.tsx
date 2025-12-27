import { Box, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <Box component="footer" className="footer_container">
      <Box className="footer_section left">
        <Typography>© 2025 VeterinaryComp</Typography>
      </Box>

      <Box className="footer_section center">
        <NavLink className="footer_nav_link" to="/privacy-policy">
          Privacy Policy
        </NavLink>
      </Box>

      <Box className="footer_section right">
        <Typography className="contact_info">
          Contact us: support@veterinarycomp.com
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;