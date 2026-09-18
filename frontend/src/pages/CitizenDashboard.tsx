import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  Search,
  ListFilter,
  CheckCircle2,
  Clock,
  Wrench,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { storageService } from "../services/storageService";
import type { Report } from "../types";
import "../App.css";

export function CitizenDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const all = storageService.getReports();
    // Filter to user's reports if user exists
    const userReports = user
      ? all.filter((r) => !r.userId || r.userId === user.id)
      : all;
    setReports(userReports);
  }, [user]);

  const totalReports = reports.length;
  const underReview = reports.filter((r) => r.status === "Under Review").length;
  const actionTaken = reports.filter((r) => r.status === "Action Taken").length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;
  const submitted = reports.filter((r) => r.status === "Submitted").length;

  // Category breakdown
  const categoryCounts = reports.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const recentReports = reports.slice(0, 4);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="report-page">
      <Navbar />

      <main className="report-container dashboard-container">
        {/* WELCOME BANNER */}
        <div className="dashboard-welcome-card">
          <div className="welcome-text-col">
            <span className="section-label">COMMUNITY DASHBOARD</span>
            <h1>Welcome back, {user?.name.split(" ")[0] || "Citizen"}!</h1>
            <p>
              Your observations help maintain safety, hygiene, and environmental
              standards across your neighborhood.
            </p>
          </div>

          <div className="welcome-action-buttons">
            <Link to="/report" className="primary-button dash-report-cta">
              <Camera size={18} />
              Report an Issue
            </Link>
          </div>
        </div>

        {/* METRIC STATS CARDS */}
        <div className="dashboard-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-icon total">
              <ListFilter size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">Total Submissions</span>
              <strong className="dash-stat-value">{totalReports}</strong>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon review">
              <Clock size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">Under Review</span>
              <strong className="dash-stat-value">{underReview}</strong>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon action">
              <Wrench size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">Action Taken</span>
              <strong className="dash-stat-value">{actionTaken}</strong>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon resolved">
              <CheckCircle2 size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">Resolved</span>
              <strong className="dash-stat-value">{resolved}</strong>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT: RECENT REPORTS & SVG VISUALIZATION */}
        <div className="dashboard-content-split">
          {/* RECENT REPORTS COLUMN */}
          <div className="dashboard-main-col">
            <div className="dash-section-header">
              <h3>Recent Submissions</h3>
              <Link to="/reports" className="dash-view-all-link">
                View All ({totalReports}) <ArrowRight size={15} />
              </Link>
            </div>

            <div className="dash-recent-list">
              {recentReports.length === 0 ? (
                <div className="empty-dash-box">
                  <p>You haven't submitted any civic reports yet.</p>
                  <Link to="/report" className="primary-button small-btn">
                    Submit First Report
                  </Link>
                </div>
              ) : (
                recentReports.map((item) => (
                  <div
                    key={item.id}
                    className="dash-recent-item"
                    onClick={() => navigate(`/tracking?id=${item.id}`)}
                  >
                    <div className="dash-item-left">
                      <span className="dash-item-id">{item.id}</span>
                      <strong className="dash-item-title">
                        {item.category}
                      </strong>
                      <p className="dash-item-desc">{item.description}</p>
                      <div className="dash-item-meta">
                        <span>
                          <Calendar size={13} style={{ marginRight: 4 }} />
                          {formatDate(item.createdAt)}
                        </span>
                        <span>•</span>
                        <span>
                          <MapPin size={13} style={{ marginRight: 4 }} />
                          {item.address || "Location logged"}
                        </span>
                      </div>
                    </div>

                    <div className="dash-item-right">
                      <StatusBadge status={item.status} size="sm" />
                      <span
                        className={`severity-pill severity-${item.severity.toLowerCase()}`}
                      >
                        {item.severity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SIDEBAR: ANALYTICS VISUAL & QUICK ACTIONS */}
          <div className="dashboard-side-col">
            {/* SVG / CSS ANALYTICS VISUALIZATION */}
            <div className="dash-widget-card">
              <div className="widget-header">
                <TrendingUp size={18} />
                <h4>Resolution Distribution</h4>
              </div>

              {/* Pure CSS/SVG progress bars */}
              <div className="dash-progress-list">
                <div className="progress-row">
                  <div className="progress-labels">
                    <span>Resolved</span>
                    <strong>
                      {totalReports > 0
                        ? Math.round((resolved / totalReports) * 100)
                        : 0}
                      %
                    </strong>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill fill-resolved"
                      style={{
                        width: `${
                          totalReports > 0 ? (resolved / totalReports) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="progress-row">
                  <div className="progress-labels">
                    <span>Action in Progress</span>
                    <strong>
                      {totalReports > 0
                        ? Math.round((actionTaken / totalReports) * 100)
                        : 0}
                      %
                    </strong>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill fill-action"
                      style={{
                        width: `${
                          totalReports > 0
                            ? (actionTaken / totalReports) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="progress-row">
                  <div className="progress-labels">
                    <span>Under Review / Queued</span>
                    <strong>
                      {totalReports > 0
                        ? Math.round(
                            ((underReview + submitted) / totalReports) * 100
                          )
                        : 0}
                      %
                    </strong>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill fill-review"
                      style={{
                        width: `${
                          totalReports > 0
                            ? ((underReview + submitted) / totalReports) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="category-tag-list">
                <span className="category-tag-title">Categories:</span>
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <span key={cat} className="category-stat-pill">
                    {cat}: <strong>{count}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* QUICK ACTIONS CARD */}
            <div className="dash-widget-card">
              <h4>Quick Actions</h4>
              <div className="quick-action-links">
                <Link to="/report" className="quick-action-btn">
                  <Camera size={16} />
                  <span>Report New Issue</span>
                </Link>

                <Link to="/tracking" className="quick-action-btn">
                  <Search size={16} />
                  <span>Track by Report ID</span>
                </Link>

                <Link to="/reports" className="quick-action-btn">
                  <ListFilter size={16} />
                  <span>Browse All My Reports</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CitizenDashboard;
