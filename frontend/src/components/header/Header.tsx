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
    <Box className="header_container" component="header">
      <AppBar
        component="nav"
        className="appbar"
        style={{
          height: "68px",
          position: "absolute",
          background: "#d3d3d3",
          fontWeight: "500",
          display: "flex",
          justifyContent: "center",
        }}>
        <Toolbar className="nav_container">
          <NavLink to="/" className="logo_link">
            <img src={logo_expanded} alt="Logo" className="logo" />
          </NavLink>
          <IconButton
            id="burger_menu"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
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
