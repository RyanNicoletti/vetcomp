import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/header/Header";
import Home from "./pages/Home";
import AddCompForm from "./pages/AddCompForm";
import { Box } from "@mui/material";
import Footer from "./components/footer/Footer";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import { SnackbarProvider } from "./context/SnackbarContext";
import AdminPage from "./pages/AdminPage";
import { ProtectedRoute } from "./components/protectedroute/ProtectedRoute";
import PolicyPage from "./pages/PolicyPage";
import LandingPage from "./pages/LandingPage";
import ForgotPasswordEmail from "./pages/ForgotPasswordEmail";
import { PasswordReset } from "./pages/Passwordreset";
import DashboardPage from "./pages/DashboardPage";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <AuthProvider>
        <SnackbarProvider>
          <Box className="app_container">
            <Box className="nav_container">
              <Header />
            </Box>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/addcomp" element={<AddCompForm />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/privacy-policy" element={<PolicyPage />} />
              <Route
                path="/forgot-password"
                element={<ForgotPasswordEmail />}
              />
              <Route
                path="/reset-password/:token"
                element={<PasswordReset />}
              />
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Routes>
            <Footer />
          </Box>
        </SnackbarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;