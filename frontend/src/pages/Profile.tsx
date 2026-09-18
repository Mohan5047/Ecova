import { useState, useEffect } from "react";
import {
  User as UserIcon,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Save,
  LogOut,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { storageService } from "../services/storageService";
import "../App.css";

export function Profile() {
  const { user, updateProfile, logout, switchDemoRole } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [successMsg, setSuccessMsg] = useState("");

  const [submittedCount, setSubmittedCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
      setDepartment(user.department || "");

      const reports = storageService.getUserReports(user.id);
      setSubmittedCount(reports.length);
      setResolvedCount(reports.filter((r) => r.status === "Resolved").length);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      department: department.trim(),
    });
    setSuccessMsg("Profile information updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "January 2026";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="report-page profile-page">
      <Navbar />

      <main className="report-container profile-container">
        <div className="profile-grid">
          {/* PROFILE SUMMARY CARD */}
          <div className="profile-summary-card">
            <div className="profile-avatar-large">
              {user?.role === "authority" ? (
                <Building2 size={40} />
              ) : user?.role === "admin" ? (
                <ShieldCheck size={40} />
              ) : (
                <UserIcon size={40} />
              )}
            </div>

            <h2>{user?.name || "Civic Citizen"}</h2>
            <p className="profile-email-tag">{user?.email}</p>

            <div className="profile-role-pill">
              <ShieldCheck size={14} />
              <span>{user?.role ? user.role.toUpperCase() : "CITIZEN"} ACCOUNT</span>
            </div>

            <div className="profile-stats-mini">
              <div className="mini-stat">
                <FileText size={18} className="mini-icon-reports" />
                <div>
                  <strong>{submittedCount}</strong>
                  <span>Reports Filed</span>
                </div>
              </div>

              <div className="mini-stat">
                <CheckCircle2 size={18} className="mini-icon-resolved" />
                <div>
                  <strong>{resolvedCount}</strong>
                  <span>Issues Resolved</span>
                </div>
              </div>
            </div>

            <div className="profile-member-date">
              <Calendar size={14} />
              <span>Joined ECOVA in {formatDate(user?.createdAt)}</span>
            </div>

            <button
              type="button"
              className="profile-logout-button"
              onClick={logout}
            >
              <LogOut size={16} />
              Sign Out of Account
            </button>
          </div>

          {/* EDIT PROFILE DETAILS CARD */}
          <div className="profile-edit-card">
            <div className="profile-edit-header">
              <span className="section-label">ACCOUNT SETTINGS</span>
              <h3>Personal Information</h3>
              <p>
                Manage your public display name and contact phone number.
                Sensitive credentials remain securely encrypted.
              </p>
            </div>

            {successMsg && (
              <div className="modal-success-banner" style={{ marginBottom: 20 }}>
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-form-group">
                <label htmlFor="p-name">Full Name</label>
                <input
                  id="p-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="p-email">Email Address</label>
                <input
                  id="p-email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  title="Email cannot be changed directly"
                  className="input-disabled"
                />
                <span className="field-hint">
                  Your email is linked to verification logs and cannot be edited.
                </span>
              </div>

              <div className="profile-form-group">
                <label htmlFor="p-phone">Phone Number</label>
                <input
                  id="p-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {user?.role === "authority" && (
                <div className="profile-form-group">
                  <label htmlFor="p-dept">Assigned Department</label>
                  <input
                    id="p-dept"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              )}

              <button type="submit" className="primary-button profile-save-btn">
                <Save size={16} />
                Save Changes
              </button>
            </form>

            {/* Quick Demo Switcher Section */}
            <div className="profile-demo-switcher">
              <div className="demo-switch-header">
                <Sparkles size={16} />
                <h4>Quick Role Switcher (Development Testing)</h4>
              </div>
              <p>
                Switch between personas instantly to test Citizen, Authority, and
                Admin views:
              </p>
              <div className="demo-switch-buttons">
                <button
                  type="button"
                  className={`demo-pill ${user?.role === "citizen" ? "active" : ""}`}
                  onClick={() => switchDemoRole("citizen")}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  className={`demo-pill ${user?.role === "authority" ? "active" : ""}`}
                  onClick={() => switchDemoRole("authority")}
                >
                  Authority
                </button>
                <button
                  type="button"
                  className={`demo-pill ${user?.role === "admin" ? "active" : ""}`}
                  onClick={() => switchDemoRole("admin")}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
