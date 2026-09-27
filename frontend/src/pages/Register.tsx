import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password, phone.trim());
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration could not be completed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page auth-page">
      <header className="report-header">
        <Link to="/" className="report-logo">
          <span className="logo-icon">
            <Leaf size={19} />
          </span>
          ECOVA
        </Link>
        <Link to="/" className="back-home">
          Back to Home
        </Link>
      </header>

      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-circle">
              <Leaf size={24} />
            </div>
            <h2>Join ECOVA</h2>
            <p>Create your citizen account to report civic issues and follow community improvements.</p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full Name */}
            <div className="auth-field">
              <label htmlFor="reg-name">Full Name</label>
              <div className="auth-input-box">
                <User size={18} className="auth-field-icon" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="reg-email">Email Address</label>
              <div className="auth-input-box">
                <Mail size={18} className="auth-field-icon" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="priya@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="auth-field">
              <label htmlFor="reg-phone">Phone Number (Optional)</label>
              <div className="auth-input-box">
                <Phone size={18} className="auth-field-icon" />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="reg-password">Password (Min. 6 characters)</label>
              <div className="auth-input-box">
                <Lock size={18} className="auth-field-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  required
                />
                <button
                  type="button"
                  className="auth-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <div className="auth-input-box">
                <Lock size={18} className="auth-field-icon" />
                <input
                  id="reg-confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
            </div>

            {/* Account Role Notice */}
            <div className="auth-role-notice">
              <ShieldCheck size={16} />
              <span>
                Standard registration creates a <strong>Citizen Account</strong>. Municipal department credentials are provisioned by regional administrators.
              </span>
            </div>

            <button type="submit" className="primary-button auth-submit-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Free Account"}
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already registered?{" "}
              <Link to="/login" className="auth-register-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;
