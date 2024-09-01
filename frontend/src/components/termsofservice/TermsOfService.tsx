import { useEffect, createRef } from "react";
import "./TermsOfService.css";

const TermsOfService = () => {
  const terms: any = createRef();

  useEffect(() => {
    fetch(
      "https://app.termageddon.com/api/policy/YVhOMk5rTjNiV1JEWW1GSWVIYzlQUT09?no-title=true"
    )
      .then((res) => res.text())
      .then((res) => (terms.current.innerHTML = res));
  }, []);

  return (
    <div className="tos-container">
      <h1 className="tos-title">Terms of Service</h1>
      <div className="tos-text" ref={terms}></div>
    </div>
  );
};

export default TermsOfService;
