import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
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
import TermsOfService from "./components/tos-privacypolicy-cookies/termsofservice/TermsOfService";
import Cookies from "./components/tos-privacypolicy-cookies/cookies/Cookies";
import About from "./pages/About";
import LandingPage from "./pages/LandingPage";
import ForgotPasswordEmail from "./pages/ForgotPasswordEmail";
import { PasswordReset } from "./pages/Passwordreset";
import { Profile } from "./components/profile/Profile";

function App() {
  return (
    <Router>
      <Box className="app_container">
        <SnackbarProvider>
          <Box className="nav_container">
            <Header />
          </Box>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/my-profile" element={<Profile />} />
            <Route path="/addcomp" element={<AddCompForm />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/privacy-policy" element={<PolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/forgot-password" element={<ForgotPasswordEmail />} />
            <Route path="/reset-password/:token" element={<PasswordReset />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Routes>
          <Footer />
        </SnackbarProvider>
      </Box>
    </Router>
  );
}

export default App;
