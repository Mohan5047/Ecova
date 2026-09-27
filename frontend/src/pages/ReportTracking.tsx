import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Camera,
  Calendar,
  AlertCircle,
  FileQuestion,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";
import LocationPreview from "../components/LocationPreview";
import EmptyState from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { api } from "../services/api";
import type { Report } from "../types";
import "../App.css";

export function ReportTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reportIdInput, setReportIdInput] = useState("");
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [loading, setLoading] = useState(false);

  const doSearch = async (idToSearch: string) => {
    const trimmed = idToSearch.trim().toUpperCase();
    if (!trimmed) {
      setSearchError("Please enter a valid Report ID (e.g. ECOVA-100001).");
      return;
    }
    setSearchError("");
    setHasSearched(true);
    setLoading(true);

    try {
      const found = await api.getReportByCode(trimmed);
      setCurrentReport(found);
    } catch (err: any) {
      setSearchError(err.message || "Failed to load report details.");
      setCurrentReport(null);
    } finally {
      setLoading(false);
    }
  };

  // Sync with URL query parameter
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setReportIdInput(idFromUrl);
      doSearch(idFromUrl);
    } else {
      // Default to initial seeded report
      setReportIdInput("ECOVA-100001");
      doSearch("ECOVA-100001");
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportIdInput.trim()) {
      setSearchParams({ id: reportIdInput.trim().toUpperCase() });
      doSearch(reportIdInput);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="report-page tracking-page-root">
      <Navbar />

      <main className="report-container tracking-container">
        {/* HEADER / INTRO */}
        <div className="report-intro">
          <span className="section-label">LIVE STATUS TRACKING</span>
          <h1>
            Track your report
            <span> in real time.</span>
          </h1>
          <p>
            Enter your unique ECOVA Report ID below to monitor review status,
            field actions, and resolution notes from responsible authorities.
          </p>
        </div>

        {/* SEARCH BOX */}
        <div className="tracking-search-card">
          <form onSubmit={handleSearchSubmit} className="tracking-form">
            <div className="tracking-input-wrapper">
              <Search className="tracking-input-icon" size={20} />
              <input
                type="text"
                value={reportIdInput}
                onChange={(e) => {
                  setReportIdInput(e.target.value);
                  setSearchError("");
                }}
                placeholder="Enter Report ID (e.g. ECOVA-100001)"
                aria-label="Report ID"
              />
            </div>
            <button type="submit" className="primary-button track-submit-btn">
              Track Report
            </button>
          </form>

          {searchError && (
            <div className="inline-field-error" style={{ marginTop: 12 }}>
              <AlertCircle size={15} />
              <span>{searchError}</span>
            </div>
          )}

          {/* Quick sample chips */}
          <div className="sample-id-chips">
            <span>Try sample IDs:</span>
            {["ECOVA-100001", "ECOVA-100002", "ECOVA-100003"].map((id) => (
              <button
                key={id}
                type="button"
                className="sample-chip"
                onClick={() => {
                  setReportIdInput(id);
                  setSearchParams({ id });
                  doSearch(id);
                }}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* RESULT SECTION */}
        {loading && (
          <div style={{ padding: "40px 0", display: "flex", justifyContent: "center" }}>
            <LoadingSpinner text="Retrieving report and status timeline from database..." />
          </div>
        )}

        {!loading && hasSearched && !currentReport && (
          <EmptyState
            icon={FileQuestion}
            title="We couldn't find a report with that ID"
            description={`No civic issue found matching "${reportIdInput}". Please double-check the ID or submit a new report.`}
            actionText="Report an Issue"
            actionLink="/report"
          />
        )}

        {!loading && currentReport && (
          <div className="tracking-result-grid">
            {/* LEFT COLUMN: DETAILS & PHOTO */}
            <div className="tracking-details-card">
              <div className="tracking-card-header">
                <div>
                  <span className="report-id-sub">OFFICIAL RECORD</span>
                  <h2>{currentReport.id}</h2>
                </div>
                <StatusBadge status={currentReport.status} size="lg" />
              </div>

              {/* Photo */}
              {currentReport.photoUrl && (
                <div className="tracking-photo-box">
                  <img
                    src={currentReport.photoUrl}
                    alt={`Evidence for ${currentReport.id}`}
                    className="tracking-photo-img"
                  />
                  <span className="tracking-photo-tag">
                    <Camera size={13} /> Photo Evidence
                  </span>
                </div>
              )}

              {/* Meta Grid */}
              <div className="report-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Category</span>
                  <strong className="meta-value">{currentReport.category}</strong>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Severity Level</span>
                  <span
                    className={`severity-pill severity-${currentReport.severity.toLowerCase()}`}
                  >
                    {currentReport.severity} Concern
                  </span>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Reported On</span>
                  <strong className="meta-value">
                    <Calendar size={13} style={{ marginRight: 5 }} />
                    {formatDate(currentReport.createdAt)}
                  </strong>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Assigned Authority</span>
                  <strong className="meta-value">
                    {currentReport.assignedAuthority ||
                      "Pending Department Assignment"}
                  </strong>
                </div>
              </div>

              {/* Description */}
              <div className="report-description-box">
                <h4>Issue Description</h4>
                <p>{currentReport.description}</p>
              </div>

              {/* Action Notes from Authority if available */}
              {currentReport.actionNotes && (
                <div className="authority-action-box">
                  <h4>Authority Note</h4>
                  <p>{currentReport.actionNotes}</p>
                </div>
              )}

              {/* Location */}
              <div className="report-location-section">
                <h4>Report Location</h4>
                <LocationPreview
                  latitude={currentReport.latitude}
                  longitude={currentReport.longitude}
                  address={currentReport.address}
                  height={190}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: TIMELINE */}
            <div className="tracking-timeline-col">
              <StatusTimeline
                currentStatus={currentReport.status}
                history={currentReport.statusHistory}
                createdAt={currentReport.createdAt}
              />

              {/* Next Steps Card */}
              <div className="tracking-help-card">
                <h4>Need to provide further information?</h4>
                <p>
                  If conditions have changed at this location or this report is
                  urgent, you can submit an update with new photos.
                </p>
                <div className="help-card-actions">
                  <Link to="/report" className="primary-button small-btn">
                    Submit New Issue
                  </Link>
                  <Link to="/reports" className="secondary-button small-btn">
                    My Other Reports
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ReportTracking;
