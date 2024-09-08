import "./AboutPageContent.css";

export const AboutPageContent = () => {
  return (
    <div className="about-container">
      <section className="about-section">
        <h2>Our Story</h2>
        <p>
          Veterinarycomp.com was born from personal experience. As a
          veterinarian for about 5 years, I found myself unknowingly underpaid;
          my wife, also a veterinarian, had similar experiences in the
          profession. We realized how challenging it was to determine fair
          compensation when looking for new jobs or assessing our current
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
          VeterinaryComp is dedicated to providing transparency in veterinary
          compensation. We aim to empower veterinary professionals with
          accurate, up-to-date salary information to make informed career
          decisions and ensure they are fairly compensated for their valuable
          work.
        </p>
      </section>

      <section className="about-section">
        <h2>What We Offer</h2>
        <ul>
          <li>Comprehensive salary data for various veterinary positions</li>
          <li>User-friendly interface to explore and compare compensation</li>
          <li>Ability to contribute your own salary information anonymously</li>
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
          Users can browse our database of veterinary salaries, filtered by
          factors such as location, experience, and specialization. Registered
          users can also contribute their own salary information anonymously,
          which is verified before being added to our database. This
          collaborative approach helps build a comprehensive and current picture
          of veterinary compensation.
        </p>
      </section>

      <section className="about-section">
        <h2>Privacy and Security</h2>
        <p>
          We take your privacy seriously. All personal information is encrypted
          and securely stored. Salary information is anonymized before being
          displayed in our database, ensuring that individual contributions
          cannot be traced back to specific users.
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
      </section>
    </div>
  );
};
