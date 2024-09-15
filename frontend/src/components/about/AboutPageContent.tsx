import { Button } from "@mui/material";
import "./AboutPageContent.css";
import { Link } from "react-router-dom";

export const AboutPageContent = () => {
  return (
    <div className="about-container">
      <section className="about-section">
        <h2>Our Story</h2>
        <p>
          Veterinarycomp.com was created and is maintained by two veterinarians
          who experienced significant pay discrepancies in their careers. After
          finding themselves substantially underpaid, they recognized the
          widespread nature of this issue in the veterinary profession. This
          realization highlighted the challenges in determining fair
          compensation when seeking new employment or evaluating current
          positions.
        </p>
        <p>
          This lack of salary transparency inspired the creation of
          Veterinarycomp.com. Our goal is to prevent other veterinarians from
          experiencing the same financial setbacks we did, by providing a clear
          picture of the financial landscape in veterinary medicine.
        </p>
      </section>

      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          Veterinarycomp.com is dedicated to providing transparency in
          veterinary compensation. We aim to empower veterinary professionals
          with accurate, up-to-date salary information to make informed career
          decisions and ensure they are fairly compensated for their valuable
          work.
        </p>
      </section>

      <section className="about-section">
        <h2>What We Offer</h2>
        <ul>
          <li>Comprehensive salary data for various veterinary positions</li>
          <li>User-friendly interface to explore and compare compensation</li>
          <li>
            Ability to contribute your own salary information{" "}
            <span
              style={{
                backgroundColor: "#e6f3ff",
                color: "#0066cc",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}>
              safely and anonymously
            </span>{" "}
          </li>
          <li>Verified data to ensure accuracy and reliability</li>
          <li className="coming-soon">
            Insights into how your compensation stacks up against regional pay
            <span className="coming-soon-tag">Coming Soon</span>
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2>How It Works</h2>
        <p>
          Users can contribute their salary information anonymously, which is
          verified before being added to our database. This collaborative
          approach helps build a comprehensive and current picture of veterinary
          compensation. Users can also freely browse our database of veterinary
          salaries.
        </p>
      </section>

      <section className="about-section">
        <h2>Privacy and Security</h2>
        <p>
          We take your privacy seriously. All personal information is encrypted
          in transit and securely stored. If and when users submit documents to
          verify their salary data; the documents are reviewed and then promptly
          deleted from our system.
        </p>
      </section>

      <section className="about-section">
        <h2>Join Us in Making a Difference</h2>
        <p>
          By contributing your compensation details to Veterinarycomp.com,
          you're becoming part of a movement to improve compensation
          transparency in the veterinary field. Your contributions help fellow
          veterinarians make informed decisions about their careers and
          negotiate fair salaries.
        </p>
        <div id="add-btn">
          <Button
            component={Link}
            to="/addcomp"
            variant="contained"
            color="primary">
            Add Compensation
          </Button>
        </div>
      </section>
    </div>
  );
};
