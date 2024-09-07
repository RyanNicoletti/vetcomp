import { Box, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <Box component="footer" className="footer_container">
      <Typography paragraph>© 2024 Veterinarycomp.com</Typography>
      <Box className="tos_links">
        <NavLink className="footer_nav_link" to="/privacy-policy">
          Privacy Policy
        </NavLink>
        <p>|</p>
        <NavLink className="footer_nav_link" to="/terms-of-service">
          Terms of Service
        </NavLink>
        <p>|</p>
        <NavLink className="footer_nav_link" to="/cookies">
          Cookies
        </NavLink>
      </Box>
    </Box>
  );
};

export default Footer;
