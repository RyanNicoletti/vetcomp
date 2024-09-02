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
import Cookies from "./components/tos-privacypolicy-cookies/cookies/cookies";

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
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/addcomp" element={<AddCompForm />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/privacy-policy" element={<PolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cookies" element={<Cookies />} />
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

function About() {
  return <div>ab</div>;
}

export default App;
