import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  ExternalLink,
  MapPin,
  Calendar,
  Inbox,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { storageService } from "../services/storageService";
import type { Report } from "../types";
import "../App.css";

export function MyReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    const allReports = storageService.getReports();
    // Filter to user's reports if user exists, otherwise show demo list
    const userReports = user
      ? allReports.filter((r) => !r.userId || r.userId === user.id)
      : allReports;
    setReports(userReports);
  }, [user]);

  const categories = [
    "ALL",
    "Waste & Garbage",
    "Water Issue",
    "Pollution",
    "Nature & Greenery",
    "Public Surroundings",
    "Other",
  ];

  const statuses = ["ALL", "Submitted", "Under Review", "Action Taken", "Resolved"];

  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        const matchesSearch =
          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.address && r.address.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
          statusFilter === "ALL" || r.status === statusFilter;

        const matchesCategory =
          categoryFilter === "ALL" || r.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortBy === "newest" ? timeB - timeA : timeA - timeB;
      });
  }, [reports, searchTerm, statusFilter, categoryFilter, sortBy]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="report-page">
      <Navbar />

      <main className="report-container reports-container">
        {/* HEADER */}
        <div className="page-header-row">
          <div>
            <span className="section-label">CITIZEN PORTAL</span>
            <h1>My Submitted Reports</h1>
            <p>
              View and track all issues you have reported across your neighborhood.
            </p>
          </div>
          <Link to="/report" className="primary-button add-report-btn">
            <Plus size={18} />
            Report New Issue
          </Link>
        </div>

        {/* CONTROLS: SEARCH & FILTERS */}
        <div className="reports-filter-bar">
          <div className="filter-search-input">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search by ID, keyword, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdowns">
            {/* Status Filter */}
            <div className="filter-select-wrapper">
              <Filter size={15} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL" ? "All Statuses" : s}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="filter-select-wrapper">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              className="sort-toggle-btn"
              onClick={() =>
                setSortBy(sortBy === "newest" ? "oldest" : "newest")
              }
              title="Toggle sort order"
            >
              <ArrowUpDown size={15} />
              <span>{sortBy === "newest" ? "Newest First" : "Oldest First"}</span>
            </button>
          </div>
        </div>

        {/* STATUS QUICK TABS */}
        <div className="status-pill-tabs">
          {statuses.map((s) => {
            const count =
              s === "ALL"
                ? reports.length
                : reports.filter((r) => r.status === s).length;
            return (
              <button
                key={s}
                type="button"
                className={`status-tab-btn ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "ALL" ? "All Reports" : s}
                <span className="tab-counter">{count}</span>
              </button>
            );
          })}
        </div>

        {/* REPORTS LIST */}
        {filteredReports.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No reports match your filters"
            description="Try clearing your search term or selecting 'All Statuses' to view other records."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
              setCategoryFilter("ALL");
            }}
          />
        ) : (
          <div className="reports-card-grid">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="user-report-card"
                onClick={() => navigate(`/tracking?id=${report.id}`)}
              >
                <div className="user-report-header">
                  <div>
                    <span className="user-report-id">{report.id}</span>
                    <h3 className="user-report-category">{report.category}</h3>
                  </div>
                  <StatusBadge status={report.status} size="sm" />
                </div>

                <p className="user-report-desc">{report.description}</p>

                <div className="user-report-meta">
                  <div className="user-report-meta-item">
                    <MapPin size={14} />
                    <span>{report.address || "GPS Location detected"}</span>
                  </div>
                  <div className="user-report-meta-item">
                    <Calendar size={14} />
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                </div>

                <div className="user-report-footer">
                  <span
                    className={`severity-indicator severity-${report.severity.toLowerCase()}`}
                  >
                    {report.severity} Severity
                  </span>

                  <span className="view-tracking-link">
                    Track Report <ExternalLink size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default MyReports;
