import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Building2, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export function Login() {
  const navigate = useNavigate();
  const { login, switchDemoRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      if (user.role === "authority") {
        navigate("/authority");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: "citizen" | "authority" | "admin") => {
    try {
      setLoading(true);
      await switchDemoRole(role);
      if (role === "authority") {
        navigate("/authority");
      } else if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to switch demo role.");
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
            <h2>Sign in to ECOVA</h2>
            <p>Access your citizen reports, municipal actions, and local civic updates.</p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <div className="auth-input-box">
                <Mail size={18} className="auth-field-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={() => alert("Password reset link has been simulated to your email.")}
                >
                  Forgot password?
                </button>
              </div>
              <div className="auth-input-box">
                <Lock size={18} className="auth-field-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="primary-button auth-submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Quick Demo Login Switcher */}
          <div className="auth-demo-divider">
            <span>OR TEST WITH ONE-CLICK ROLES</span>
          </div>

          <div className="auth-demo-grid">
            <button
              type="button"
              className="demo-role-btn citizen"
              onClick={() => handleQuickDemo("citizen")}
            >
              <User size={16} />
              <span>Citizen Demo</span>
            </button>

            <button
              type="button"
              className="demo-role-btn authority"
              onClick={() => handleQuickDemo("authority")}
            >
              <Building2 size={16} />
              <span>Authority Demo</span>
            </button>

            <button
              type="button"
              className="demo-role-btn admin"
              onClick={() => handleQuickDemo("admin")}
            >
              <ShieldCheck size={16} />
              <span>Admin Demo</span>
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account yet?{" "}
              <Link to="/register" className="auth-register-link">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
