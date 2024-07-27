import { NavLink } from "react-router-dom";
import "./NavBar.css";
import { IoClose, IoMenu } from "react-icons/io5";
import { useState, useEffect } from "react";
import logo_expanded from "../../assets/logo_expanded.png";
import logo_abrev from "../../assets/logo_abrev.png";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 942);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeMenuOnMobile = () => {
    if (isMobile) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 942);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="header">
      <nav className="nav container">
        <NavLink to="/" className="nav__logo">
          <img
            src={isMobile ? logo_abrev : logo_expanded}
            alt="Logo"
            className="logo"
          />
        </NavLink>

        <div
          className={`nav__menu ${showMenu ? "show-menu" : ""}`}
          id="nav-menu">
          <ul className="nav__list">
            {["Home", "About", "Contact", "Sign up", "Log in"].map((item) => (
              <li key={item} className="nav__item">
                <NavLink
                  to={
                    item === "Home"
                      ? "/"
                      : `/${item.toLowerCase().replace(" ", "")}`
                  }
                  className={({ isActive }) =>
                    `nav__link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMenuOnMobile}>
                  {item}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="nav__close" id="nav-close" onClick={toggleMenu}>
            <IoClose />
          </div>
        </div>

        <div className="nav__toggle" id="nav-toggle" onClick={toggleMenu}>
          <IoMenu />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
