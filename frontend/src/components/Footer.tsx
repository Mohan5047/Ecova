 import React from 'react';
import { Leaf, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="ecova-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-icon">
              <Leaf size={18} />
            </span>
            ECOVA
          </Link>
          <p className="footer-tagline">
            Civic and environmental issue reporting and response platform.
            Turning community concerns into prompt, transparent action.
          </p>
          <div className="footer-badges">
            <span className="footer-pill">
              <ShieldCheck size={14} /> Official Civic Tech
            </span>
            <span className="footer-pill">
              <Heart size={14} /> For Clean Communities
            </span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="/#how-it-works">How it Works</a></li>
            <li><a href="/#issues">Issue Categories</a></li>
            <li><a href="/#about">About ECOVA</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Actions</h4>
          <ul>
            <li><Link to="/report">Report an Issue</Link></li>
            <li><Link to="/tracking">Track a Report</Link></li>
            <li><Link to="/reports">My Reports</Link></li>
            <li><Link to="/dashboard">Citizen Dashboard</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Authorities & Team</h4>
          <ul>
            <li><Link to="/authority">Authority Portal</Link></li>
            <li><Link to="/admin">Admin Console</Link></li>
            <li><Link to="/profile">User Profile</Link></li>
            <li><Link to="/login">Sign In</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 ECOVA. Cleaner. Safer. Together. 🇮🇳</p>
        <span className="footer-subtext">Designed for rapid municipal routing and community transparency.</span>
      </div>
    </footer>
  );
};

export default Footer;
