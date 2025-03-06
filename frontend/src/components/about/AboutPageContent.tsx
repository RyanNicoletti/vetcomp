import { Button } from "@mui/material";
import "./AboutPageContent.css";
import { Link } from "react-router-dom";

export const AboutPageContent = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About VeterinaryComp</h1>

      <section className="about-section">
        <h2>Our Story</h2>
        <p>
          VeterinaryComp was created and is maintained by veterinarians who
          experienced firsthand the consequences of pay discrepancies in the
          field. After discovering they were significantly underpaid compared to
          colleagues, our founders recognized an issue affecting the entire
          profession: a lack of transparency in compensation.
        </p>
        <p>
          This personal experience revealed how challenging it is for veterinary
          professionals to determine fair compensation when seeking employment
          or evaluating current positions. Without reliable salary data,
          veterinarians are often left in the dark about their true market
          value.
        </p>
        <p>
          Our goal in creating this website is to prevent others from
          experiencing the same financial setbacks by providing clear visibility
          into the compensation landscape of veterinary medicine.
        </p>
      </section>

      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          VeterinaryComp is dedicated to bringing transparency to veterinary
          compensation. We empower veterinary professionals with accurate,
          up-to-date salary information to make informed career decisions and
          ensure they receive fair compensation for their valuable work.
        </p>
        <p>
          We believe every veterinary professional deserves to know their worth
          in the marketplace and have the tools to negotiate appropriate
          compensation.
        </p>
      </section>

      <section className="about-section">
        <h2>What We Offer</h2>
        <div className="features-grid">
          <div className="feature-item">
            <h3>Salary Transparency</h3>
            <p>
              Comprehensive, anonymous salary data for various veterinary
              positions across different regions and practice types.
            </p>
          </div>
          <div className="feature-item">
            <h3>Verified Information</h3>
            <p>
              All submitted compensation data is reviewed for accuracy before
              being added to our database.
            </p>
          </div>
          <div className="feature-item">
            <h3>Genuine Job Board</h3>
            <p>
              Job listings with mandatory salary transparency and sign-on bonus
              information - no recruiter spam or fake posts.
            </p>
          </div>
          <div className="feature-item">
            <h3>Anonymous Contributions</h3>
            <p>
              Share your compensation details privately and securely,
              contributing to better transparency for all.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Our Job Board: A Better Way</h2>
        <ul className="benefits-list">
          <li>
            <span className="highlight">Mandatory Salary Transparency</span> -
            All job posts must include salary ranges and sign-on bonus
            information, no exceptions
          </li>
          <li>
            <span className="highlight">Real Opportunities Only</span> - No
            recruiter spam, misleading postings, or bait-and-switch tactics
          </li>
          <li>
            <span className="highlight">Direct Connections</span> - Connect
            directly with veterinary practices and hospitals without
            intermediaries
          </li>
          <li>
            <span className="highlight">Simplified Application Process</span> -
            Easy application process designed specifically for veterinary
            professionals
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Privacy & Security Commitment</h2>
        <p>
          Your privacy is our priority. All personal information is encrypted in
          transit and securely stored. Your data is never sold or shared with
          third parties. When users submit documents to verify salary
          information, these documents are reviewed and then promptly deleted
          from our system.
        </p>
        <p>
          Compensation data remains completely anonymous, with only the
          information you explicitly provide (location, experience level, etc.)
          being visible to other users.
        </p>
      </section>

      <section className="about-section highlight-section">
        <h2>Join Our Mission</h2>
        <p>
          By contributing your compensation details to VeterinaryComp, you
          become part of a movement to improve transparency in the veterinary
          field. Your anonymous contributions help fellow veterinarians make
          informed decisions about their careers and negotiate fair salaries.
        </p>
        <div className="cta-container">
          <Button
            component={Link}
            to="/addcomp"
            variant="contained"
            color="primary"
            size="large"
            className="cta-button">
            Add Your Compensation
          </Button>
          <Button
            component={Link}
            to="/jobs"
            variant="outlined"
            color="primary"
            size="large"
            className="cta-button">
            Browse Job Board
          </Button>
        </div>
      </section>
    </div>
  );
};
