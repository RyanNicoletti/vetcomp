import { useEffect, useRef } from "react";
import "./Policy.css";

const Policy = () => {
  const policy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(
      "https://app.termageddon.com/api/policy/ZDBkNU1DdElibE5STmxSM00xRTlQUT09?no-title=true"
    )
      .then((res) => res.text())
      .then((res) => {
        if (policy.current) {
          policy.current.innerHTML = res;
        }
      });
  }, []);

  return (
    <div className="policy-container">
      <div className="policy-content">
        <h1 className="policy-title">Privacy Policy</h1>
        <div className="policy-text" ref={policy}></div>
      </div>
    </div>
  );
};

export default Policy;
