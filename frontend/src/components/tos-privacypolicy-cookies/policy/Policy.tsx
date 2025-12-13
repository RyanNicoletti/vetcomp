import "./Policy.css";

const PrivacyPolicy = () => {
  return (
    <div className="policy-container">
      <div className="policy-content">
        <h1 className="policy-title">Privacy Policy</h1>
        <p className="effective-date">Effective Date: December 13, 2025</p>

        <section className="policy-section">
          <p>
            VeterinaryComp.com is committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, store, and protect
            your information when you use our platform.
          </p>
        </section>

        <section className="policy-section">
          <h2>Information We Collect</h2>
          <p>When you create an account on VeterinaryComp.com, we collect:</p>
          <ul>
            <li>
              <strong>Account Information:</strong> Email address, username, and
              password (encrypted)
            </li>
          </ul>
          <p>When you submit compensation information, we collect:</p>
          <ul>
            <li>
              <strong>Compensation Data:</strong> Salary information,
              location, years of experience, practice type, and other
              professional details you voluntarily submit
            </li>
            <li>
              <strong>Verification Documents:</strong> If you choose to verify
              your compensation data, we temporarily collect supporting
              documents (pay stubs, offer letters, etc.). These documents are deleted from veterinarycomp.com storage after being reviewed.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>How We Use Your Information</h2>
          <p>Your information is used solely to:</p>
          <ul>
            <li>Operate and maintain the VeterinaryComp.com platform</li>
            <li>
              Display anonymized compensation data to help veterinary
              professionals understand market rates
            </li>
            <li>Verify the accuracy of submitted compensation information</li>
            <li>Communicate with you about your account</li>
            <li>
              Improve our services and develop new features for the veterinary
              community
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>Data Storage and Security</h2>
          <p>
            All data is stored securely on Render.com servers with
            industry-standard encryption. We use:
          </p>
          <ul>
            <li>Encrypted connections (HTTPS) for all data transmission</li>
            <li>Regular security updates and monitoring</li>
            <li>Access controls to protect your information</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>What We Do Not Do With Your Data</h2>
          <ul>
            <li>
              <strong>We do not sell your data</strong> to third parties,
              advertisers, or anyone else
            </li>
            <li>
              <strong>We do not share your personal information</strong> with
              external companies or marketing firms
            </li>
            <li>
              <strong>We do not use your data for advertising</strong> or
              marketing purposes beyond our own platform
            </li>
            <li>
              <strong>We do not share individually identifiable data</strong> such as email addresses
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>How Data is Displayed on Veterinarycomp.com</h2>
          <p>
            When you submit compensation information, the following is displayed to other
            users:
          </p>
          <ul>
            <li>Practice Name</li>
            <li>Location</li>
            <li>Years of experience</li>
            <li>Practice type and setting</li>
            <li>Compensation details you choose to share</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>Verification Documents</h2>
          <p>
            If you upload verification documents (such as pay stubs or offer
            letters):
          </p>
          <ul>
            <li>
              These documents are reviewed solely to confirm the accuracy of
              your submitted information
            </li>
            <li>
              Documents are promptly deleted after verification is complete
            </li>
            <li>
              Verification documents are never shared with other users or third
              parties
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul>
            <li>
              Access, update, or delete your account and compensation data at
              any time
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>Data Retention</h2>
          <p>
            We retain your account information and compensation data for as long
            as your account is active. If you delete your account, we will
            remove your personal information, though anonymized compensation
            data may remain in our database to maintain the integrity of our
            dataset for the community.
          </p>
        </section>

        <section className="policy-section">
          <h2>Cookies and Tracking</h2>
          <p>
            We use essential cookies to maintain your session and ensure the
            platform functions properly. We do not use third-party tracking
            cookies or advertising cookies.
          </p>
        </section>

        <section className="policy-section">
          <h2>Third-Party Services</h2>
          <p>
            VeterinaryComp.com is hosted on Render.com, which provides our
            infrastructure services. Render.com has access to data only as
            necessary to provide hosting services and is bound by their own
            privacy policies. We do not share your data with any
            third-party services for marketing or advertising purposes.
          </p>
        </section>

        <section className="policy-section">
          <h2>Children's Privacy</h2>
          <p>
            Our platform is intended for veterinary professionals and is not
            directed at individuals under the age of 18. We do not knowingly
            collect information from minors.
          </p>
        </section>

        <section className="policy-section">
          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated effective date. We
            encourage you to review this policy periodically.
          </p>
        </section>

        <section className="policy-section">
          <h2>Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy or how
            we handle your data, please contact us at:
          </p>
          <p className="contact-email">
            <strong>support@veterinarycomp.com</strong>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;