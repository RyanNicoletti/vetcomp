import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import NavBar from "./components/navbar/NavBar";
import Home from "./pages/Home";
import AddCompForm from "./pages/AddCompForm";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/addcomp" element={<AddCompForm />} />
      </Routes>
    </Router>
  );
}

function About() {
  return <div>ab</div>;
}
function Contact() {
  return <div>C</div>;
}

export default App;
