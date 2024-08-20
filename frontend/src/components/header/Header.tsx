import { useState } from "react";
import logo_expanded from "../../assets/logo_expanded.png";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AlertColor,
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
import { getAuthStatus } from "../../queries/authQueries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../../queries/usersQueries";
import CustomSnackbar from "../snackbar/Snackbar";

const linkStyle = {
  padding: "8px 16px",
  color: "#333333",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: 500,
  transition: "background-color 0.3s ease",
  cursor: "pointer",
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as AlertColor,
    onClose: () => {},
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: isAuthenticated } = useQuery({
    queryKey: ["isAuthenticated"],
    queryFn: () => getAuthStatus(),
  });

  const navItems: string[] =
    isAuthenticated === true
      ? ["Home", "About", "Log out"]
      : ["Home", "About", "Sign up", "Log in"];

  const toggleDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  const logoutUserMutation = useMutation({
    mutationFn: logoutUser,
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.message || "Logout failed. Please try again.",
        severity: "error",
        onClose: () => {},
      });
    },
    onSuccess: async (data: any) => {
      queryClient.setQueryData(["isAuthenticated"], false);
      navigate("/");
      setSnackbar({
        open: true,
        message: data.message || "Log out successful.",
        severity: "success",
        onClose: () => {},
      });
    },
  });

  const handleLogout = () => {
    logoutUserMutation.mutate();
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
    <>
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
              {navItems.map((item) => {
                if (item === "Log out") {
                  return (
                    <Link
                      style={linkStyle}
                      onClick={handleLogout}
                      className="desktop_nav_item"
                      key={item}>
                      {item}
                    </Link>
                  );
                } else {
                  return (
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
                  );
                }
              })}
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
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </>
  );
};

export default Header;
