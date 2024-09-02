import { useEffect, useState } from "react";

const PrivacySettings: React.FC = () => {
  const [isUCUIReady, setIsUCUIReady] = useState(false);

  useEffect(() => {
    const checkUCUI = () => {
      // @ts-ignore
      if (window.UC_UI && typeof window.UC_UI.showSecondLayer === "function") {
        setIsUCUIReady(true);
      } else {
        setTimeout(checkUCUI, 100);
      }
    };

    checkUCUI();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // @ts-ignore
    if (window.UC_UI && typeof window.UC_UI.showSecondLayer === "function") {
      // @ts-ignore
      window.UC_UI.showSecondLayer();
    }
  };

  //   if (!isUCUIReady) return null;

  return (
    <a
      href="#"
      onClick={handleClick}
      id="usercentrics-psl"
      style={{ textDecoration: "underline", color: "blue" }}>
      Privacy Settings
    </a>
  );
};

export default PrivacySettings;
