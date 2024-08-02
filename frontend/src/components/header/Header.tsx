import { useState } from "react";
import logo_expanded from "../../assets/logo_expanded.png";
import logo_abrev from "../../assets/logo_abrev.png";
import { NavLink } from "react-router-dom";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import "./Header.css";

const navItems: string[] = ["Home", "About", "Sign up", "Log in"];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const toggleDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawerContent = (
    <Box
      onClick={toggleDrawer}
      className="drawer-container"
      style={{
        width: "250px",
        height: "100%",
        backgroundColor: "lightgrey",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
      <NavLink
        to="/"
        className="mobile_logo_link"
        style={{
          borderBottom: "solid black 2px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "20px 0",
          marginBottom: "20px",
        }}>
        <img
          src={logo_abrev}
          alt="Logo"
          className="mobile_logo"
          style={{
            maxWidth: "120px",
            height: "auto",
          }}
        />
      </NavLink>
      <Divider />
      <List style={{ padding: 0 }}>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <NavLink
              to={
                item === "Home"
                  ? "/"
                  : `/${item.toLocaleLowerCase().replace(" ", "")}`
              }
              className="nav_item"
              style={{
                display: "block",
                width: "100%",
                padding: "12px 24px",
                color: "#333333",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: 500,
                transition: "background-color 0.3s ease",
              }}>
              <ListItemText primary={item} />
            </NavLink>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box className="header_container">
      <AppBar
        component="nav"
        className="appbar"
        style={{
          height: "68px",
          position: "absolute",
          background: "#d3d3d3",
          fontWeight: "500",
          display: "flex",
        }}>
        <Toolbar className="nav_container">
          <IconButton
            id="burger_menu"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <NavLink to="/" className="desktop_logo_link">
            <img src={logo_expanded} alt="Logo" className="desktop_logo" />
          </NavLink>
          <Box className="desktop_nav_items">
            {navItems.map((item) => (
              <NavLink
                to={
                  item === "Home"
                    ? "/"
                    : `/${item.toLocaleLowerCase().replace(" ", "")}`
                }
                className="desktop_nav_item"
                key={item}>
                {item}
              </NavLink>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          className="drawer">
          {drawerContent}
        </Drawer>
      </nav>
    </Box>
  );
};

export default Header;
