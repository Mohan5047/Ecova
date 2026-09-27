import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Droplets,
  Leaf,
  MapPin,
  Recycle,
  Send,
  ShieldAlert,
  TreePine,
  Upload,
  X,
  Building,
  AlertTriangle,
  Search,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import "../App.css";

export function ReportIssue() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // FORM STATES
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High" | "">("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState("");

  // Read preselected category from query params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, [searchParams]);

  // Handle photo object URL lifecycle to prevent memory leaks
  useEffect(() => {
    if (!photo) {
      setPhotoPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photo]);

  const categories = [
    { name: "Waste & Garbage", icon: Recycle },
    { name: "Water Issue", icon: Droplets },
    { name: "Pollution", icon: ShieldAlert },
    { name: "Nature & Greenery", icon: TreePine },
    { name: "Public Surroundings", icon: Building },
    { name: "Other", icon: Leaf },
  ];

  // PHOTO HANDLER
  const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError("");
    setFormError("");
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setPhotoError("Please upload a valid image file (PNG, JPG, or JPEG).");
      return;
    }

    // Validate size: max 6MB
    if (file.size > 6 * 1024 * 1024) {
      setPhotoError("Image size exceeds 6MB limit. Please choose a smaller photo.");
      return;
    }

    setPhoto(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // GEOLOCATION HANDLER
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError("");
    setFormError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: `GPS: ${position.coords.latitude.toFixed(4)}° N, ${position.coords.longitude.toFixed(4)}° E`,
        });
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location permission was denied. Please allow location access in your browser settings."
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError("Could not retrieve your location. Please retry.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  // SUBMISSION HANDLER
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!photo) {
      setFormError("Please upload a photo of the issue (Step 01).");
      return;
    }
    if (!category) {
      setFormError("Please choose an issue category (Step 02).");
      return;
    }
    if (!location) {
      setFormError("Please detect your current location (Step 03).");
      return;
    }
    if (!description.trim()) {
      setFormError("Please provide a description of what you noticed (Step 04).");
      return;
    }
    if (!severity) {
      setFormError("Please choose a severity level (Step 05).");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("photo", photo);
      formData.append("category", category);
      formData.append("description", description.trim());
      formData.append("severity", severity.toUpperCase());
      formData.append("latitude", location.latitude.toString());
      formData.append("longitude", location.longitude.toString());
      if (location.address) {
        formData.append("address", location.address);
      }

      const created = await api.createReport(formData);
      setGeneratedReportId(created.id);
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCategory("");
    setSeverity("");
    setDescription("");
    removePhoto();
    setLocation(null);
    setLocationError("");
    setFormError("");
    setGeneratedReportId("");
  };

  // SUCCESS SCREEN
  if (submitted) {
    return (
      <div className="report-page">
        <header className="report-header">
          <Link to="/" className="report-logo">
            <span className="logo-icon">
              <Leaf size={19} />
            </span>
            ECOVA
          </Link>

          <Link to="/" className="back-home">
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </header>

        <main className="report-container success-container">
          <div className="success-card">
            <div className="success-icon">
              <CheckCircle2 size={55} />
            </div>

            <span className="section-label">REPORT SUBMITTED</span>

            <h1>
              Thank you for helping
              <span> your community.</span>
            </h1>

            <p>
              Your report has been recorded and safely stored. The issue has
              been queued and will be assigned to the relevant municipal
              authority for review and remediation.
            </p>

            <div className="report-id-box">
              <span>UNIQUE REPORT ID</span>
              <strong>{generatedReportId}</strong>
            </div>

            <div className="success-actions">
              <button
                type="button"
                className="submit-report track-success-btn"
                onClick={() => navigate(`/tracking?id=${generatedReportId}`)}
              >
                <Search size={17} />
                Track Report
              </button>

              <button
                type="button"
                className="success-home-button"
                onClick={resetForm}
              >
                <RotateCcw size={16} style={{ marginRight: 6 }} />
                Report Another Issue
              </button>

              <Link to="/" className="success-home-button">
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="report-page">
      {/* HEADER */}
      <header className="report-header">
        <Link to="/" className="report-logo">
          <span className="logo-icon">
            <Leaf size={19} />
          </span>
          ECOVA
        </Link>

        <div className="header-right-links">
          <Link to="/tracking" className="back-home" style={{ marginRight: 18 }}>
            <Search size={16} />
            Track Report
          </Link>
          <Link to="/" className="back-home">
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="report-container">
        {/* INTRO */}
        <div className="report-intro">
          <span className="section-label">SUBMIT CIVIC REPORT</span>
          <h1>
            Help make your
            <span> surroundings better.</span>
          </h1>
          <p>
            Tell us what you noticed. A few details and photo evidence help the
            right municipal team understand the urgency and take swift action.
          </p>
        </div>

        {/* FORM ERROR BANNER */}
        {formError && (
          <div className="form-error-banner" role="alert">
            <AlertTriangle size={18} />
            <span>{formError}</span>
          </div>
        )}

        <form className="report-card-form" onSubmit={handleSubmit}>
          {/* STEP 01 - PHOTO */}
          <section className="form-section">
            <div className="form-heading">
              <div className="form-number">01</div>
              <div>
                <h2>Add a photo</h2>
                <p>A clear picture helps authorities understand the issue faster.</p>
              </div>
            </div>

            {!photo ? (
              <label className="upload-box">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handlePhoto}
                />
                <div className="upload-icon">
                  <Camera size={25} />
                </div>
                <strong>Upload photo evidence</strong>
                <span>PNG, JPG, or JPEG up to 6MB</span>
                <div className="upload-button">
                  <Upload size={16} />
                  Choose photo from device
                </div>
              </label>
            ) : (
              <div className="selected-photo-card">
                <div className="photo-preview-wrapper">
                  {photoPreviewUrl && (
                    <img
                      src={photoPreviewUrl}
                      alt="Selected issue preview"
                      className="photo-preview-img"
                    />
                  )}
                </div>

                <div className="photo-info-col">
                  <div className="photo-info">
                    <CheckCircle2 size={20} />
                    <div>
                      <strong>{photo.name}</strong>
                      <span>
                        {(photo.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission
                      </span>
                    </div>
                  </div>

                  <div className="photo-actions">
                    <label className="replace-photo-btn">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handlePhoto}
                        style={{ display: "none" }}
                      />
                      Replace Photo
                    </label>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="remove-photo-btn"
                    >
                      <X size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {photoError && (
              <div className="inline-field-error">
                <AlertTriangle size={14} />
                <span>{photoError}</span>
              </div>
            )}
          </section>

          {/* STEP 02 - CATEGORY */}
          <section className="form-section">
            <div className="form-heading">
              <div className="form-number">02</div>
              <div>
                <h2>What did you notice?</h2>
                <p>Choose the category that best describes the civic or environmental issue.</p>
              </div>
            </div>

            <div className="category-grid">
              {categories.map((item) => {
                const Icon = item.icon;
                const selected = category === item.name;

                return (
                  <button
                    type="button"
                    key={item.name}
                    className={`category-option ${selected ? "selected" : ""}`}
                    onClick={() => {
                      setCategory(item.name);
                      setFormError("");
                    }}
                  >
                    <Icon size={21} />
                    <span>{item.name}</span>
                    {selected && (
                      <CheckCircle2 size={17} className="category-check" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 03 - LOCATION */}
          <section className="form-section">
            <div className="form-heading">
              <div className="form-number">03</div>
              <div>
                <h2>Where is it?</h2>
                <p>Adding precise GPS coordinates ensures the report routes to the correct municipal ward.</p>
              </div>
            </div>

            <button
              type="button"
              className={`location-box ${location ? "location-detected" : ""}`}
              onClick={getLocation}
              disabled={locationLoading}
            >
              <div className="location-box-icon">
                <MapPin size={21} />
              </div>

              <div className="location-box-text">
                <strong>
                  {location
                    ? "Location detected successfully"
                    : locationLoading
                    ? "Detecting your location..."
                    : "Use my current location"}
                </strong>
                <span>
                  {location
                    ? `Lat: ${location.latitude.toFixed(5)}, Long: ${location.longitude.toFixed(5)}`
                    : locationError || "We'll ask for one-time browser location permission"}
                </span>
              </div>

              {!location && !locationLoading && (
                <ArrowLeft className="location-arrow" size={18} />
              )}

              {location && (
                <CheckCircle2 className="location-success" size={20} />
              )}
            </button>

            {locationError && (
              <div className="inline-field-error">
                <AlertTriangle size={14} />
                <span>{locationError}</span>
              </div>
            )}
          </section>

          {/* STEP 04 - DESCRIPTION */}
          <section className="form-section">
            <div className="form-heading">
              <div className="form-number">04</div>
              <div>
                <h2>Tell us more</h2>
                <p>Describe the specific conditions, nearby landmarks, or hazards.</p>
              </div>
            </div>

            <textarea
              value={description}
              onChange={(event) => {
                if (event.target.value.length <= 500) {
                  setDescription(event.target.value);
                  setFormError("");
                }
              }}
              placeholder="Example: Severe garbage accumulation overflowing from the municipal bin behind the community hall, blocking the sidewalk for 3 days..."
              rows={5}
              maxLength={500}
            />

            <div
              className={`character-count ${
                description.length >= 450 ? "character-warning" : ""
              }`}
            >
              {description.length}/500 characters
            </div>
          </section>

          {/* STEP 05 - SEVERITY */}
          <section className="form-section">
            <div className="form-heading">
              <div className="form-number">05</div>
              <div>
                <h2>How serious is it?</h2>
                <p>Help teams prioritize urgent public safety and environmental risks.</p>
              </div>
            </div>

            <div className="severity-options">
              {/* LOW */}
              <button
                type="button"
                className={severity === "Low" ? "active" : ""}
                onClick={() => {
                  setSeverity("Low");
                  setFormError("");
                }}
              >
                <span className="severity-dot low" />
                <div>
                  <strong>Low</strong>
                  <small>Minor aesthetic or early concern</small>
                </div>
              </button>

              {/* MEDIUM */}
              <button
                type="button"
                className={severity === "Medium" ? "active" : ""}
                onClick={() => {
                  setSeverity("Medium");
                  setFormError("");
                }}
              >
                <span className="severity-dot medium" />
                <div>
                  <strong>Medium</strong>
                  <small>Needs municipal attention soon</small>
                </div>
              </button>

              {/* HIGH */}
              <button
                type="button"
                className={severity === "High" ? "active" : ""}
                onClick={() => {
                  setSeverity("High");
                  setFormError("");
                }}
              >
                <span className="severity-dot high" />
                <div>
                  <strong>High</strong>
                  <small>Urgent health or safety hazard</small>
                </div>
              </button>
            </div>
          </section>

          {/* SUBMIT AREA */}
          <div className="submit-area">
            <div className="privacy-note">
              <ShieldAlert size={17} />
              <span>
                Your report information will only be shared with verified
                municipal authorities and maintenance wings.
              </span>
            </div>

            <button type="submit" className="submit-report" disabled={submitting}>
              {submitting ? "Submitting Report..." : "Submit Report"}
              <Send size={18} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ReportIssue;