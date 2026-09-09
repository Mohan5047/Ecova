import { Leaf, Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* LOGO */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-icon">
            <Leaf size={20} />
          </span>

          <span>ECOVA</span>
        </Link>

        {/* NAV LINKS */}
        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          <a href="/#how-it-works" onClick={closeMenu}>
            How it works
          </a>

          <a href="/#issues" onClick={closeMenu}>
            Issues
          </a>

          <a href="/#about" onClick={closeMenu}>
            About
          </a>

          <Link
            to="/report"
            className="mobile-report"
            onClick={closeMenu}
          >
            Report an Issue
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* DESKTOP REPORT BUTTON */}
        <Link to="/report" className="desktop-report">
          Report an Issue
          <ArrowRight size={17} />
        </Link>

        {/* MOBILE MENU */}
        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

      </div>
    </nav>
  );
}

export default Navbar;