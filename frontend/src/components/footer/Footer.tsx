import { Box, Typography } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { NavLink } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <Box component="footer" className="footer_container">
      <Box className="footer_section left">
        <Typography>© 2025 VeterinaryComp</Typography>
      </Box>

      <Box className="footer_section center">
        <Box className="tos_links">
          <NavLink className="footer_nav_link" to="/privacy-policy">
            Privacy Policy
          </NavLink>
          <p>|</p>
          <NavLink className="footer_nav_link" to="/terms-of-service">
            Terms of Service
          </NavLink>
        </Box>
      </Box>

      <Box className="footer_section right">
        <Box className="social_links">
          <a
            href="https://www.linkedin.com/company/veterinarycomp"
            target="_blank"
            rel="noopener noreferrer"
            className="footer_nav_link linkedin_link">
            <LinkedInIcon />
            <span>Follow us on LinkedIn</span>
          </a>
        </Box>
        <Typography className="contact_info">
          Contact us: support@veterinarycomp.com
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
