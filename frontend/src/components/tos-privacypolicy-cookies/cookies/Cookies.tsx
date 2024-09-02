import { useEffect, useRef } from "react";
import "./Cookies.css";
import PrivacySettings from "../PrivacySettings";

const Cookies = () => {
  const cookies = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(
      "https://app.termageddon.com/api/policy/U1daTU1YbHJjbkp3TUdGbE5uYzlQUT09?no-title=true"
    )
      .then((res) => res.text())
      .then((res) => {
        if (cookies.current) {
          cookies.current.innerHTML = res;
        }
      })
      .catch((error) => console.error("Error fetching cookies policy:", error));
  }, []);

  return (
    <div className="policy-container">
      <div className="policy-content">
        <h1 className="policy-title">Cookies Policy</h1>
        <div className="policy-text" ref={cookies}></div>
        <div className="privacy-settings-link">
          You are free to change your privacy settings at any time by clicking
          the following link: <PrivacySettings />
        </div>
      </div>
    </div>
  );
};

export default Cookies;
