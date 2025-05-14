import { Button } from "@mui/material";
import "./AboutPageContent.css";
import { Link } from "react-router-dom";

export const AboutPageContent = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About VeterinaryComp</h1>

      <section className="about-section">
        <h2>How This Started</h2>
        <p>
          Veterinarycomp.com started with a pretty simple realization: many
          veterinarians are getting paid significantly less than their
          colleagues for the same work, regardless of years of experience.
        </p>

        <p>
          This website grew from that idea. VeterinaryComp was created as a tool
          to help during job searches and salary negotiations; a straightforward
          way to see real compensation data from across the veterinary field.
        </p>
      </section>

      <section className="about-section">
        <h2>What This Site Does</h2>
        <p>
          Veterinarycomp.com helps bring transparency to veterinary medicine.
          It's pretty straightforward, veterinary professionals anonymously
          share their compensation details, and that information becomes
          available to help others understand the financial landscape.
        </p>
        <p>
          The goal is simple: help vets ensure they get paid what they are worth
          in the job market so they can make better career decisions and
          negotiate fair pay. No more wondering if you're being underpaid or if
          a job offer is competitive.
        </p>
      </section>

      <section className="about-section">
        <h2>What You'll Find Here</h2>
        <div className="features-grid">
          <div className="feature-item">
            <h3>Real Salary Data</h3>
            <p>
              Anonymous, actual compensation numbers from veterinarians across
              different regions, specialties, and practice types.
            </p>
          </div>
          <div className="feature-item">
            <h3>Verified Information</h3>
            <p>
              Submitted compensation data is reviewed before adding to ensure
              it's legitimate without compromising anonymity.
            </p>
          </div>
          <div className="feature-item">
            <h3>No-Nonsense Job Board</h3>
            <p>
              Job listings that actually tell you the salary range up front so
              there's no more wasting time on interviews only to discover the
              pay is too low.
            </p>
          </div>
          <div className="feature-item">
            <h3>Privacy-First Approach</h3>
            <p>
              Share your compensation details securely without worry. We use
              industry standard encryption and do not sell your data.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>How Your Data is Handled</h2>
        <p>
          Your privacy matters. When you submit compensation information, it
          remains anonymous. The only details visible to others are what you
          explicitly share such as location, experience level, and practice
          type.
        </p>
        <p>
          If you upload verification documents, they're reviewed solely to
          confirm the information's accuracy and then promptly deleted. This
          site doesn't sell data to third parties or use it for marketing
          purposes.
        </p>
        <p>
          All data is encrypted in transit and stored securely. This platform
          exists to help the veterinary community, not to monetize your
          information.
        </p>
      </section>

      <section className="about-section">
        <h2>Our Job Board: A Better Way</h2>
        <ul className="benefits-list">
          <li>
            <span className="highlight">Mandatory Salary Transparency </span>
            Details about salary are required in all job posts
          </li>
          <li>
            <span className="highlight">Real Opportunities Only </span>
            No recruiter spam, misleading postings, or bait-and-switch tactics
          </li>
          <li>
            <span className="highlight">Direct Connections </span>
            Connect directly with veterinary practices and hospitals without
            intermediaries
          </li>
          <li>
            <span className="highlight">Simplified Application Process </span>
            Easy application process designed specifically for veterinary
            professionals
          </li>
        </ul>
      </section>

      <section className="about-section highlight-section">
        <h2>Why Your Contribution Matters</h2>
        <p>
          Every time someone adds their compensation details, it makes this
          resource more valuable for all of us in the veterinary community. Your
          anonymous contribution might be exactly what helps another vet realize
          they're being underpaid or gives them the confidence to negotiate a
          better salary.
        </p>
        <p>
          The more of us who share our information, the more accurate and useful
          this tool becomes. It's a simple way to help each other out in a
          profession that doesn't always make compensation discussions easy.
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
