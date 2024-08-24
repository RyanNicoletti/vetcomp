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
