import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Camera,
  Calendar,
  AlertCircle,
  FileQuestion,
  ThumbsUp,
  Printer,
  Star,
  MapPin,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";
import LocationPreview from "../components/LocationPreview";
import EmptyState from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { InteractiveMap } from "../components/InteractiveMap";
import { HelplinesModal } from "../components/HelplinesModal";
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

  // Community & Extra features state
  const [upvoting, setUpvoting] = useState(false);
  const [helplinesOpen, setHelplinesOpen] = useState(false);

  // Citizen Feedback state
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const doSearch = async (idToSearch: string) => {
    const trimmed = idToSearch.trim().toUpperCase();
    if (!trimmed) {
      setSearchError("Please enter a valid Report ID (e.g. ECOVA-100001).");
      return;
    }
    setSearchError("");
    setHasSearched(true);
    setLoading(true);
    setFeedbackSuccess(false);
    setRating(0);
    setFeedbackText("");

    try {
      const found = await api.getReportByCode(trimmed);
      setCurrentReport(found);
      if (found?.rating) {
        setRating(found.rating);
      }
      if (found?.feedbackText) {
        setFeedbackText(found.feedbackText);
      }
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

  const handleUpvote = async () => {
    if (!currentReport || upvoting) return;
    setUpvoting(true);
    try {
      const res = await api.toggleUpvote(currentReport.id);
      setCurrentReport((prev) =>
        prev
          ? {
              ...prev,
              upvotes: res.upvotes,
              hasUpvoted: res.upvoted,
            }
          : null
      );
    } catch (err: any) {
      console.error("Failed to upvote:", err);
    } finally {
      setUpvoting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReport || rating === 0) {
      setFeedbackError("Please select a star rating (1 to 5).");
      return;
    }
    setSubmittingFeedback(true);
    setFeedbackError("");
    try {
      const updated = await api.submitFeedback(currentReport.id, rating, feedbackText);
      setCurrentReport(updated);
      setFeedbackSuccess(true);
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
            <LoadingSpinner message="Retrieving report and status timeline from database..." />
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
                <div className="tracking-header-actions">
                  {/* UPVOTE BUTTON */}
                  <button
                    type="button"
                    className={`tracking-upvote-btn ${currentReport.hasUpvoted ? "upvoted" : ""}`}
                    onClick={handleUpvote}
                    disabled={upvoting}
                    title="Endorse or upvote this civic issue"
                  >
                    <ThumbsUp size={15} />
                    <span>{currentReport.upvotes || 0} Upvotes</span>
                  </button>

                  {/* PRINT OFFICIAL SLIP BUTTON */}
                  <button
                    type="button"
                    className="tracking-print-btn"
                    onClick={handlePrint}
                    title="Print or save official report slip"
                  >
                    <Printer size={15} />
                    <span>Print Slip</span>
                  </button>

                  <StatusBadge status={currentReport.status} size="lg" />
                </div>
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

              {/* Interactive Location Map */}
              <div className="report-location-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ margin: 0 }}>Report Location & GPS Mapping</h4>
                  {currentReport.latitude && currentReport.longitude && (
                    <span style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 600 }}>
                      Lat: {currentReport.latitude.toFixed(4)}, Long: {currentReport.longitude.toFixed(4)}
                    </span>
                  )}
                </div>

                {currentReport.latitude && currentReport.longitude ? (
                  <div className="tracking-map-wrapper">
                    <InteractiveMap
                      mode="viewer"
                      reports={[currentReport]}
                      center={[currentReport.latitude, currentReport.longitude]}
                      zoom={15}
                      height="230px"
                    />
                    <div className="tracking-address-banner">
                      <MapPin size={15} color="#059669" />
                      <span>{currentReport.address || `GPS: ${currentReport.latitude.toFixed(5)}, ${currentReport.longitude.toFixed(5)}`}</span>
                    </div>
                  </div>
                ) : (
                  <LocationPreview
                    latitude={currentReport.latitude}
                    longitude={currentReport.longitude}
                    address={currentReport.address}
                    height={190}
                  />
                )}
              </div>

              {/* CITIZEN RESOLUTION FEEDBACK & STAR RATING (WHEN RESOLVED) */}
              {currentReport.status === "Resolved" && (
                <div className="resolution-feedback-card">
                  <div className="resolution-feedback-header">
                    <CheckCircle2 size={22} className="feedback-check-icon" />
                    <div>
                      <h4>Citizen Resolution Feedback</h4>
                      <p>
                        This issue has been officially marked as resolved. Please help us evaluate the civic authority's response quality.
                      </p>
                    </div>
                  </div>

                  {currentReport.rating ? (
                    <div className="feedback-submitted-display">
                      <div className="stars-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            className={star <= (currentReport.rating || 0) ? "star-filled" : "star-empty"}
                          />
                        ))}
                        <span className="rating-score">({currentReport.rating} / 5 stars)</span>
                      </div>
                      {currentReport.feedbackText && (
                        <p className="feedback-submitted-text">
                          "{currentReport.feedbackText}"
                        </p>
                      )}
                      <span className="feedback-verified-badge">
                        ✓ Citizen Feedback Recorded in Official Audit Log
                      </span>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                      <div className="star-picker">
                        <label>Rate Resolution Quality & Speed:</label>
                        <div className="stars-row interactive-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              className="star-btn"
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => {
                                setRating(star);
                                setFeedbackError("");
                              }}
                            >
                              <Star
                                size={24}
                                className={
                                  star <= (hoverRating || rating)
                                    ? "star-filled"
                                    : "star-empty"
                                }
                              />
                            </button>
                          ))}
                          {rating > 0 && (
                            <span className="star-label">
                              {rating === 5
                                ? "⭐⭐⭐⭐⭐ Outstanding"
                                : rating === 4
                                ? "⭐⭐⭐⭐ Good"
                                : rating === 3
                                ? "⭐⭐⭐ Satisfactory"
                                : rating === 2
                                ? "⭐⭐ Poor"
                                : "⭐ Unsatisfactory"}
                            </span>
                          )}
                        </div>
                      </div>

                      <textarea
                        placeholder="Add comments on whether the cleanup/repair met civic standards (optional)..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={3}
                        className="feedback-textarea"
                      />

                      {feedbackError && (
                        <div className="inline-field-error" style={{ marginBottom: 10 }}>
                          <AlertCircle size={14} />
                          <span>{feedbackError}</span>
                        </div>
                      )}

                      {feedbackSuccess && (
                        <div className="feedback-success-banner" style={{ marginBottom: 10 }}>
                          <CheckCircle2 size={16} />
                          <span>Thank you! Your feedback has been recorded.</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="primary-button small-btn"
                        disabled={submittingFeedback || rating === 0}
                      >
                        {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: TIMELINE & ACTIONS */}
            <div className="tracking-timeline-col">
              <StatusTimeline
                currentStatus={currentReport.status}
                history={currentReport.statusHistory}
                createdAt={currentReport.createdAt}
              />

              {/* Next Steps Card */}
              <div className="tracking-help-card">
                <h4>Civic Assistance & Emergency Contact</h4>
                <p>
                  Have further questions regarding this ticket or need immediate municipal assistance for an urgent hazard?
                </p>
                <div className="help-card-actions">
                  <button
                    type="button"
                    className="outline-helpline-btn"
                    onClick={() => setHelplinesOpen(true)}
                  >
                    <PhoneCall size={14} />
                    View 24/7 Helplines
                  </button>
                  <Link to="/report" className="primary-button small-btn">
                    Report Another Issue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PRINT-ONLY OFFICIAL SLIP */}
      {currentReport && (
        <div className="print-slip-container">
          <div className="print-slip-header">
            <div className="print-slip-brand">
              <h2>ECOVA CIVIC RESPONSE NETWORK</h2>
              <span>Official Issue Acknowledgement & Tracking Slip</span>
            </div>
            <div className="print-slip-badge">
              <strong>STATUS: {currentReport.status.toUpperCase()}</strong>
            </div>
          </div>

          <div className="print-slip-meta">
            <div><strong>Report Reference:</strong> {currentReport.id}</div>
            <div><strong>Filing Timestamp:</strong> {formatDate(currentReport.createdAt)}</div>
            <div><strong>Category:</strong> {currentReport.category}</div>
            <div><strong>Severity Assessment:</strong> {currentReport.severity}</div>
            <div><strong>Assigned Department:</strong> {currentReport.assignedAuthority || "Pending Assignment"}</div>
            <div><strong>Location GPS:</strong> {currentReport.latitude?.toFixed(5)}, {currentReport.longitude?.toFixed(5)}</div>
            <div><strong>Address:</strong> {currentReport.address || "Location coordinates pinned on municipal grid"}</div>
          </div>

          <div className="print-slip-body">
            <h4>Description of Reported Condition:</h4>
            <p>{currentReport.description}</p>

            {currentReport.actionNotes && (
              <>
                <h4 style={{ marginTop: 16 }}>Authority Field Action Record:</h4>
                <p>{currentReport.actionNotes}</p>
              </>
            )}

            {currentReport.rating && (
              <div style={{ marginTop: 16 }}>
                <h4>Citizen Resolution Rating:</h4>
                <p>{currentReport.rating} / 5 Stars {currentReport.feedbackText ? `("${currentReport.feedbackText}")` : ""}</p>
              </div>
            )}
          </div>

          <div className="print-slip-footer">
            <p>Generated via ECOVA Civic Intelligence Portal • Verify status online at: https://ecova.gov/tracking?id={currentReport.id}</p>
            <p className="print-slip-legal">This document serves as an electronic acknowledgement receipt for civic grievances submitted pursuant to municipal transparency protocols.</p>
          </div>
        </div>
      )}

      {/* 24/7 HELPLINES MODAL */}
      <HelplinesModal
        isOpen={helplinesOpen}
        onClose={() => setHelplinesOpen(false)}
      />

      <Footer />
    </div>
  );
}

export default ReportTracking;
