import { useEffect, useRef } from "react";
import "./TermsOfService.css";

const TermsOfService = () => {
  const terms = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(
      "https://app.termageddon.com/api/policy/YVhOMk5rTjNiV1JEWW1GSWVIYzlQUT09?no-title=true"
    )
      .then((res) => res.text())
      .then((res) => {
        if (terms.current) {
          terms.current.innerHTML = res;
        }
      });
  }, []);

  return (
    <div className="tos-container">
      <h1 className="tos-title">Terms of Service</h1>
      <div className="tos-text" ref={terms}></div>
    </div>
  );
};

export default TermsOfService;
