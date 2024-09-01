import { useEffect, createRef } from "react";
import "./Policy.css";

const Policy = () => {
  const terms: any = createRef();

  useEffect(() => {
    fetch(
      "https://app.termageddon.com/api/policy/ZDBkNU1DdElibE5STmxSM00xRTlQUT09?no-title=true"
    )
      .then((res) => res.text())
      .then((res) => (terms.current.innerHTML = res));
  }, []);

  return (
    <div className="policy-container">
      <div className="policy-content">
        <h1 className="policy-title">Privacy Policy</h1>
        <div className="policy-text" ref={terms}></div>
      </div>
    </div>
  );
};

export default Policy;
