import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Building2,
  PieChart,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { storageService } from "../services/storageService";
import type { Report, User } from "../types";
import "../App.css";

export function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "reports">("overview");

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const loadData = () => {
    setReports(storageService.getReports());
    setUsers(storageService.getUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalUsers = users.length;
  const totalReports = reports.length;
  const openReports = reports.filter((r) => r.status !== "Resolved").length;
  const resolvedReports = reports.filter((r) => r.status === "Resolved").length;
  const authoritiesCount = users.filter((u) => u.role === "authority").length;

  // Analytics breakdowns
  const categoryMap = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const severityMap = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.severity] = (acc[r.severity] || 0) + 1;
    return acc;
  }, {});

  const statusMap = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const triggerResetConfirm = () => {
    setConfirmModal({
      open: true,
      title: "Reset System Demo Data?",
      message:
        "This will reseed all reports, notifications, and demo accounts to default states. All unsaved custom data will be cleared.",
      onConfirm: () => {
        localStorage.clear();
        loadData();
        setConfirmModal({ ...confirmModal, open: false });
      },
    });
  };

  return (
    <div className="report-page admin-page">
      <Navbar />

      <main className="report-container admin-container">
        {/* HEADER */}
        <div className="admin-header-card">
          <div className="admin-badge-pill">
            <ShieldCheck size={16} />
            <span>ECOVA SYSTEM ADMINISTRATION CONSOLE</span>
          </div>
          <div className="admin-title-row">
            <div>
              <h1>System Overview & Civic Analytics</h1>
              <p>
                Platform-wide governance metrics, municipal authority routing,
                and civic infrastructure monitoring.
              </p>
            </div>
            <button
              type="button"
              className="admin-reseed-btn"
              onClick={triggerResetConfirm}
              title="Reseed sample data"
            >
              <RefreshCw size={15} />
              Reseed Mock Data
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="dashboard-stats-grid admin-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-icon total">
              <FileText size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">Total Reports</span>
              <strong className="dash-stat-value">{totalReports}</strong>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon review">
              <Clock size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">Open / Active</span>
              <strong className="dash-stat-value">{openReports}</strong>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon resolved">
              <CheckCircle2 size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">Resolved</span>
              <strong className="dash-stat-value">{resolvedReports}</strong>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon high-sev">
              <Users size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">Registered Citizens</span>
              <strong className="dash-stat-value">{totalUsers}</strong>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon action">
              <Building2 size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">Authorities Assigned</span>
              <strong className="dash-stat-value">{authoritiesCount}</strong>
            </div>
          </div>
        </div>

        {/* ADMIN NAV TABS */}
        <div className="admin-tabs-row">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <BarChart3 size={16} />
            Analytics & Distribution
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={16} />
            System Users & Roles ({users.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <FileText size={16} />
            Master Reports Registry ({reports.length})
          </button>
        </div>

        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === "overview" && (
          <div className="admin-analytics-grid">
            {/* CATEGORY BREAKDOWN */}
            <div className="admin-chart-card">
              <div className="chart-title-row">
                <PieChart size={18} />
                <h3>Reports by Issue Category</h3>
              </div>
              <div className="analytics-bar-list">
                {Object.entries(categoryMap).map(([cat, count]) => {
                  const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
                  return (
                    <div key={cat} className="analytics-bar-item">
                      <div className="analytics-labels">
                        <span>{cat}</span>
                        <strong>{count} ({pct}%)</strong>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill fill-action"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEVERITY BREAKDOWN */}
            <div className="admin-chart-card">
              <div className="chart-title-row">
                <AlertTriangle size={18} />
                <h3>Reports by Severity Risk</h3>
              </div>
              <div className="analytics-bar-list">
                {(["High", "Medium", "Low"] as const).map((sev) => {
                  const count = severityMap[sev] || 0;
                  const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
                  const fillClass =
                    sev === "High"
                      ? "fill-high"
                      : sev === "Medium"
                      ? "fill-review"
                      : "fill-resolved";

                  return (
                    <div key={sev} className="analytics-bar-item">
                      <div className="analytics-labels">
                        <span className={`severity-tag-${sev.toLowerCase()}`}>{sev} Priority</span>
                        <strong>{count} ({pct}%)</strong>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className={`progress-bar-fill ${fillClass}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STATUS BREAKDOWN */}
            <div className="admin-chart-card">
              <div className="chart-title-row">
                <CheckCircle2 size={18} />
                <h3>Resolution Pipeline Status</h3>
              </div>
              <div className="analytics-bar-list">
                {(["Submitted", "Under Review", "Action Taken", "Resolved"] as const).map(
                  (st) => {
                    const count = statusMap[st] || 0;
                    const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
                    return (
                      <div key={st} className="analytics-bar-item">
                        <div className="analytics-labels">
                          <span>{st}</span>
                          <strong>{count} ({pct}%)</strong>
                        </div>
                        <div className="progress-bar-track">
                          <div
                            className="progress-bar-fill fill-resolved"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM USERS */}
        {activeTab === "users" && (
          <div className="authority-table-wrapper">
            <table className="authority-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Assigned Role</th>
                  <th>Department / Info</th>
                  <th>Member Since</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.id}</strong></td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{u.department || u.phone || "Verified Citizen"}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: MASTER REPORTS */}
        {activeTab === "reports" && (
          <div className="authority-table-wrapper">
            <table className="authority-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Category</th>
                  <th>Citizen</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.id}</strong></td>
                    <td>{r.category}</td>
                    <td>{r.citizenName || "Citizen"}</td>
                    <td>
                      <span className={`severity-pill severity-${r.severity.toLowerCase()}`}>
                        {r.severity}
                      </span>
                    </td>
                    <td><StatusBadge status={r.status} size="sm" /></td>
                    <td>
                      <Link
                        to={`/tracking?id=${r.id}`}
                        className="table-view-btn"
                        title="View report tracking"
                      >
                        <ExternalLink size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CONFIRMATION DIALOG */}
        <Modal
          isOpen={confirmModal.open}
          onClose={() => setConfirmModal({ ...confirmModal, open: false })}
          title={confirmModal.title}
        >
          <div className="confirm-modal-body">
            <div className="confirm-icon-box">
              <AlertTriangle size={32} color="#dc2626" />
            </div>
            <p>{confirmModal.message}</p>
            <div className="modal-actions-row">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setConfirmModal({ ...confirmModal, open: false })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button danger-btn"
                onClick={confirmModal.onConfirm}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </Modal>
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;
