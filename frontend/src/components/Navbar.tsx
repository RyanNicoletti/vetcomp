import { NavLink } from "react-router-dom";
import "./NavBar.css";
import { IoClose, IoMenu } from "react-icons/io5";
import { useState } from "react";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  const closeMenuOnMobile = () => {
    if (window.innerWidth <= 1150) {
      setShowMenu(false);
    }
  };

  return (
    <header className="header">
      <nav className="nav container">
        <NavLink to="/" className="nav__logo">
          VeterinaryComp
        </NavLink>

        <div
          className={`nav__menu ${showMenu ? "show-menu" : ""}`}
          id="nav-menu">
          <ul className="nav__list">
            <li className="nav__item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  [isActive ? "active" : "", "nav__link"].join(" ")
                }
                onClick={closeMenuOnMobile}>
                Home
              </NavLink>
            </li>
            <li className="nav__item">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  [isActive ? "active" : "", "nav__link"].join(" ")
                }
                onClick={closeMenuOnMobile}>
                About
              </NavLink>
            </li>
            <li className="nav__item">
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  [isActive ? "active" : "", "nav__link"].join(" ")
                }
                onClick={closeMenuOnMobile}>
                Contact
              </NavLink>
            </li>
            <li className="nav__item">
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  [isActive ? "active" : "", "nav__link"].join(" ")
                }
                onClick={closeMenuOnMobile}>
                Sign up
              </NavLink>
            </li>
            <li className="nav__item">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  [isActive ? "active" : "", "nav__link"].join(" ")
                }
                onClick={closeMenuOnMobile}>
                Log in
              </NavLink>
            </li>
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
