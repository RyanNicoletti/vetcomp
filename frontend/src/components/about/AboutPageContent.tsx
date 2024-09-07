import "./AboutPageContent.css";

export const AboutPageContent = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About VeterinaryComp</h1>
      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          VeterinaryComp is dedicated to providing transparency in veterinary
          compensation. We aim to empower veterinary professionals with
          accurate, up-to-date salary information to make informed career
          decisions.
        </p>
      </section>
      <section className="about-section">
        <h2>What We Offer</h2>
        <ul>
          <li>Comprehensive salary data for various veterinary positions</li>
          <li>User-friendly interface to explore and compare compensation</li>
          <li>Ability to contribute your own salary information</li>
          <li>Verified data to ensure accuracy and reliability</li>
        </ul>
      </section>
      <section className="about-section">
        <h2>How It Works</h2>
        <p>
          Users can browse our database of veterinary salaries, filtered by
          factors such as location, experience, and specialization. Registered
          users can also contribute their own salary information, which is
          verified before being added to our database.
        </p>
      </section>
      <section className="about-section">
        <h2>Privacy and Security</h2>
        <p>
          We take your privacy seriously. All personal information is encrypted
          and securely stored. Salary information is anonymized before being
          displayed in our database.
        </p>
      </section>
      <section className="about-section">
        <h2>Join Us</h2>
        <p>
          Help us improve salary transparency in the veterinary field. Sign up
          today to contribute your data and access detailed compensation
          insights.
        </p>
      </section>
    </div>
  );
};
