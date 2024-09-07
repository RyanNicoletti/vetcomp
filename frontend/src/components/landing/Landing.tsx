import { Link } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Welcome to Veterinarycomp.com</h1>
        <p className="tagline">
          Empowering Veterinary Professionals with Salary Insights
        </p>
      </header>

      <main className="landing-main">
        <section className="feature-section">
          <h2>Discover Your Worth</h2>
          <p>
            Explore salary data from across the veterinary field, tailored to
            your experience and location.
          </p>
        </section>

        <section className="feature-section">
          <h2>Contribute and Compare</h2>
          <p>
            Share your compensation details anonymously and see how you stack up
            against your peers.
          </p>
        </section>

        <section className="feature-section">
          <h2>Make Informed Decisions</h2>
          <p>
            Use our data to negotiate better salaries and advance your career in
            veterinary medicine.
          </p>
        </section>

        <section className="cta-section">
          <Link to="/addcomp" className="cta-button">
            Add your Compensation
          </Link>
          <Link to="/" className="secondary-button">
            Explore Salaries
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Landing;
