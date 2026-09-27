import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileEdit,
  ExternalLink,
  MapPin,
  Save,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { Report, ReportStatus } from "../types";
import "../App.css";

export function AuthorityDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  // Modal State for updating status & adding action notes
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>("Under Review");
  const [actionNote, setActionNote] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const refreshReports = async () => {
    try {
      const list = await api.getReports();
      setReports(list);
    } catch (err) {
      console.error("Failed to load authority reports:", err);
    }
  };

  useEffect(() => {
    refreshReports();
  }, []);

  const totalReports = reports.length;
  const pendingReview = reports.filter((r) => r.status === "Submitted" || r.status === "Under Review").length;
  const highSeverity = reports.filter((r) => r.severity === "High").length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.address && r.address.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || r.status === statusFilter;

      const matchesSeverity =
        severityFilter === "ALL" || r.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [reports, searchTerm, statusFilter, severityFilter]);

  const openUpdateModal = (report: Report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setActionNote(report.actionNotes || "");
    setFeedbackMsg("");
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      await api.updateReportStatus(
        selectedReport.id,
        newStatus,
        actionNote || `Status updated to ${newStatus} by authority`,
        user?.name || "Civic Authority Officer",
        actionNote
      );

      setFeedbackMsg("Report status and field notes updated successfully!");
      await refreshReports();

      setTimeout(() => {
        setSelectedReport(null);
        setFeedbackMsg("");
      }, 1200);
    } catch (err: any) {
      setFeedbackMsg(err.message || "Failed to update report status.");
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="report-page authority-page">
      <Navbar />

      <main className="report-container authority-container">
        {/* AUTHORITY HEADER BANNER */}
        <div className="authority-header-card">
          <div className="authority-title-row">
            <div className="authority-badge-pill">
              <Building2 size={15} />
              <span>MUNICIPAL & CIVIC AUTHORITY CONSOLE</span>
            </div>
            <h1>Department Operations Console</h1>
            <p>
              Signed in as <strong>{user?.name || "Sanitation Supervisor"}</strong> ({user?.department || "Civic Environmental Sanitation Wing"}).
              Manage assigned community reports, deploy remediation teams, and broadcast status resolutions.
            </p>
          </div>
        </div>

        {/* METRICS */}
        <div className="dashboard-stats-grid authority-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-icon total">
              <Building2 size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">Assigned Reports</span>
              <strong className="dash-stat-value">{totalReports}</strong>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon review">
              <Clock size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">Pending Review</span>
              <strong className="dash-stat-value">{pendingReview}</strong>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon high-sev">
              <AlertTriangle size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">High Severity</span>
              <strong className="dash-stat-value">{highSeverity}</strong>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon resolved">
              <CheckCircle2 size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">Resolved Issues</span>
              <strong className="dash-stat-value">{resolved}</strong>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="reports-filter-bar authority-controls">
          <div className="filter-search-input">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search by Report ID, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdowns">
            <div className="filter-select-wrapper">
              <Filter size={14} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter status"
              >
                <option value="ALL">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Action Taken">Action Taken</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="filter-select-wrapper">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                aria-label="Filter severity"
              >
                <option value="ALL">All Severities</option>
                <option value="High">High Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="Low">Low Severity</option>
              </select>
            </div>
          </div>
        </div>

        {/* REPORTS TABLE / LIST */}
        {filteredReports.length === 0 ? (
          <EmptyState
            title="No matching reports found"
            description="Adjust your search filters or check back when citizens submit new civic reports."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
              setSeverityFilter("ALL");
            }}
          />
        ) : (
          <div className="authority-table-wrapper">
            <table className="authority-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Reported Date</th>
                  <th>Current Status</th>
                  <th>Authority Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <strong className="table-report-id">{report.id}</strong>
                    </td>
                    <td>
                      <span className="table-category">{report.category}</span>
                    </td>
                    <td>
                      <span className="table-location" title={report.address}>
                        <MapPin size={13} style={{ marginRight: 4 }} />
                        {report.address ? report.address.split(",")[0] : "GPS Point"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`severity-pill severity-${report.severity.toLowerCase()}`}
                      >
                        {report.severity}
                      </span>
                    </td>
                    <td>{formatDate(report.createdAt)}</td>
                    <td>
                      <StatusBadge status={report.status} size="sm" />
                    </td>
                    <td>
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="table-update-btn"
                          onClick={() => openUpdateModal(report)}
                        >
                          <FileEdit size={14} />
                          Update
                        </button>
                        <button
                          type="button"
                          className="table-view-btn"
                          onClick={() => navigate(`/tracking?id=${report.id}`)}
                          title="View public tracking page"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STATUS UPDATE MODAL */}
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Update Status: ${selectedReport?.id}`}
        >
          {selectedReport && (
            <form onSubmit={handleUpdateStatus} className="modal-form">
              {feedbackMsg && (
                <div className="modal-success-banner">
                  <CheckCircle2 size={16} />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              <div className="modal-field">
                <label>Issue Category</label>
                <div className="modal-readonly-val">{selectedReport.category}</div>
              </div>

              <div className="modal-field">
                <label>Description from Citizen</label>
                <p className="modal-desc-preview">{selectedReport.description}</p>
              </div>

              <div className="modal-field">
                <label>Select Status Progression</label>
                <div className="modal-status-grid">
                  {(["Submitted", "Under Review", "Action Taken", "Resolved"] as ReportStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        className={`modal-status-btn ${newStatus === st ? "active" : ""}`}
                        onClick={() => setNewStatus(st)}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="modal-field">
                <label htmlFor="action-note">Official Action Note / Resolution Remark</label>
                <textarea
                  id="action-note"
                  rows={4}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="e.g. Ward 82 sanitary team deployed with cleanup vehicle. Waste cleared and disposal documented."
                />
                <span className="field-hint">
                  This note will be visible to the citizen in their tracking timeline and generate an immediate status notification.
                </span>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setSelectedReport(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <Save size={16} />
                  Save Changes & Notify
                </button>
              </div>
            </form>
          )}
        </Modal>
      </main>

      <Footer />
    </div>
  );
}

export default AuthorityDashboard;
