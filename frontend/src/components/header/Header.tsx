import { useState } from "react";
import logo_expanded from "../../assets/logo_expanded.png";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Toolbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import "./Header.css";
import { useMutation } from "@tanstack/react-query";
import { logoutUser } from "../../queries/usersQueries";
import { useSnackbar } from "../../context/SnackbarContext";
import { useUserStatus } from "../../hooks/useUserStatus";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const { openSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, email, logout } = useUserStatus();

  const navItems: string[] = [
    "Home",
    "About",
    ...(isAuthenticated ? [] : ["Sign up", "Log in"]),
    ...(isAdmin ? ["Admin"] : []),
  ];

  const toggleDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  const logoutUserMutation = useMutation({
    mutationFn: logoutUser,
    onError: (error: any) => {
      openSnackbar(
        error.message || "Logout failed. Please try again.",
        "error"
      );
    },
    onSuccess: async () => {
      logout();
      navigate("/");
    },
  });

  const handleLogout = () => {
    logoutUserMutation.mutate();
  };

  const drawerContent = (
    <Box onClick={toggleDrawer} id="drawer-container">
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <NavLink
              to={
                item === "Home"
                  ? "/"
                  : `/${item.toLocaleLowerCase().replace(" ", "")}`
              }
              className="mobile_nav_item">
              <ListItemText primary={item} />
            </NavLink>
          </ListItem>
        ))}
        {isAuthenticated && email && (
          <NavLink to="/profile" className="mobile_nav_item">
            <ListItemText primary={email} />
          </NavLink>
        )}
        {isAuthenticated && (
          <Link
            onClick={handleLogout}
            className="mobile_nav_item logout-button-mobile"
            id="logout">
            <ListItemText primary={"Log out"} />
          </Link>
        )}
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
                    : `/${item.toLowerCase().replace(" ", "")}`
                }
                className="desktop_nav_item"
                key={item}>
                {item}
              </NavLink>
            ))}
            {isAuthenticated && email && (
              <NavLink to="/profile" className="desktop_nav_item">
                {email}
              </NavLink>
            )}
          </Box>
          {isAuthenticated && (
            <Link
              onClick={handleLogout}
              className="desktop_nav_item logout-button-desktop"
              id="logout">
              Log out
            </Link>
          )}
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          anchor="top"
          open={mobileOpen}
          onClose={toggleDrawer}
          className="drawer">
          {drawerContent}
        </Drawer>
      </nav>
    </Box>
  );
};

export default Header;
