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
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function ReportIssue() {
  // ==============================
  // FORM STATES
  // ==============================

  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [submitted, setSubmitted] = useState(false);

  // ==============================
  // ISSUE CATEGORIES
  // ==============================

  const categories = [
    {
      name: "Waste & Garbage",
      icon: Recycle,
    },
    {
      name: "Water Issue",
      icon: Droplets,
    },
    {
      name: "Pollution",
      icon: ShieldAlert,
    },
    {
      name: "Nature & Greenery",
      icon: TreePine,
    },
    {
      name: "Other",
      icon: Leaf,
    },
  ];

  // ==============================
  // PHOTO UPLOAD
  // ==============================

  const handlePhoto = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      setPhoto(file);
    }
  };

  // ==============================
  // GET CURRENT LOCATION
  // ==============================

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationLoading(false);
      },
      () => {
        setLocationError(
          "Location permission was denied or the location could not be detected."
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ==============================
  // SUBMIT REPORT
  // ==============================

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // Basic validation
    if (!photo) {
      alert("Please upload a photo of the issue.");
      return;
    }

    if (!category) {
      alert("Please select an issue category.");
      return;
    }

    if (!location) {
      alert("Please add your current location.");
      return;
    }

    if (!description.trim()) {
      alert("Please describe the issue.");
      return;
    }

    if (!severity) {
      alert("Please select the severity.");
      return;
    }

    // Temporary console output
    // Later this will be sent to our backend.
    console.log({
      category,
      severity,
      description,
      photo,
      location,
    });

    setSubmitted(true);
  };

  // ==============================
  // SUCCESS SCREEN
  // ==============================

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

            <span className="section-label">
              REPORT SUBMITTED
            </span>

            <h1>
              Thank you for helping
              <span> your community.</span>
            </h1>

            <p>
              Your report has been recorded successfully.
              The issue can now be reviewed and routed to
              the appropriate authority.
            </p>

            <div className="report-id-box">
              <span>REPORT ID</span>
              <strong>ECOVA-{Date.now().toString().slice(-6)}</strong>
            </div>

            <div className="success-actions">
              <button
                type="button"
                className="submit-report"
                onClick={() => {
                  setSubmitted(false);
                  setCategory("");
                  setSeverity("");
                  setDescription("");
                  setPhoto(null);
                  setLocation(null);
                  setLocationError("");
                }}
              >
                Report Another Issue
                <Send size={18} />
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

  // ==============================
  // REPORT FORM
  // ==============================

  return (
    <div className="report-page">
      {/* ==============================
          HEADER
      ============================== */}

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

      {/* ==============================
          MAIN
      ============================== */}

      <main className="report-container">

        {/* INTRO */}

        <div className="report-intro">
          <span className="section-label">
            REPORT AN ISSUE
          </span>

          <h1>
            Help make your
            <span> surroundings better.</span>
          </h1>

          <p>
            Tell us what you noticed. A few details can help
            the right people understand the problem and take
            action.
          </p>
        </div>

        {/* ==============================
            FORM
        ============================== */}

        <form
          className="report-card-form"
          onSubmit={handleSubmit}
        >

          {/* ==============================
              01 PHOTO
          ============================== */}

          <section className="form-section">
            <div className="form-heading">
              <div className="form-number">
                01
              </div>

              <div>
                <h2>Add a photo</h2>

                <p>
                  A picture helps us understand the issue
                  better.
                </p>
              </div>
            </div>

            {!photo ? (
              <label className="upload-box">

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handlePhoto}
                />

                <div className="upload-icon">
                  <Camera size={25} />
                </div>

                <strong>
                  Upload a photo
                </strong>

                <span>
                  PNG, JPG or JPEG
                </span>

                <div className="upload-button">
                  <Upload size={16} />
                  Choose photo
                </div>

              </label>
            ) : (
              <div className="selected-photo">

                <div className="photo-info">
                  <CheckCircle2 size={20} />

                  <div>
                    <strong>
                      {photo.name}
                    </strong>

                    <span>
                      Photo added successfully
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="remove-photo"
                  aria-label="Remove photo"
                >
                  <X size={18} />
                </button>

              </div>
            )}
          </section>

          {/* ==============================
              02 CATEGORY
          ============================== */}

          <section className="form-section">

            <div className="form-heading">

              <div className="form-number">
                02
              </div>

              <div>
                <h2>
                  What did you notice?
                </h2>

                <p>
                  Choose the category that best describes
                  the problem.
                </p>
              </div>

            </div>

            <div className="category-grid">

              {categories.map((item) => {

                const Icon = item.icon;

                const selected =
                  category === item.name;

                return (
                  <button
                    type="button"
                    key={item.name}
                    className={`category-option ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() =>
                      setCategory(item.name)
                    }
                  >

                    <Icon size={21} />

                    <span>
                      {item.name}
                    </span>

                    {selected && (
                      <CheckCircle2
                        size={17}
                        className="category-check"
                      />
                    )}

                  </button>
                );
              })}

            </div>
          </section>

          {/* ==============================
              03 LOCATION
          ============================== */}

          <section className="form-section">

            <div className="form-heading">

              <div className="form-number">
                03
              </div>

              <div>
                <h2>
                  Where is it?
                </h2>

                <p>
                  Adding the location helps route the report
                  correctly.
                </p>
              </div>

            </div>

            <button
              type="button"
              className={`location-box ${
                location ? "location-detected" : ""
              }`}
              onClick={getLocation}
              disabled={locationLoading}
            >

              <div className="location-box-icon">
                <MapPin size={21} />
              </div>

              <div>

                <strong>
                  {location
                    ? "Location detected"
                    : locationLoading
                    ? "Detecting location..."
                    : "Use my current location"}
                </strong>

                <span>
                  {location
                    ? `${location.latitude.toFixed(
                        5
                      )}, ${location.longitude.toFixed(5)}`
                    : locationError ||
                      "We'll ask for location permission"}
                </span>

              </div>

              {!location && !locationLoading && (
                <ArrowLeft
                  className="location-arrow"
                  size={18}
                />
              )}

              {location && (
                <CheckCircle2
                  className="location-success"
                  size={20}
                />
              )}

            </button>

          </section>

          {/* ==============================
              04 DESCRIPTION
          ============================== */}

          <section className="form-section">

            <div className="form-heading">

              <div className="form-number">
                04
              </div>

              <div>
                <h2>
                  Tell us more
                </h2>

                <p>
                  Describe what you noticed.
                </p>
              </div>

            </div>

            <textarea
              value={description}
              onChange={(event) => {
                if (
                  event.target.value.length <= 500
                ) {
                  setDescription(
                    event.target.value
                  );
                }
              }}
              placeholder="Example: A large amount of garbage has been accumulating near the public park for several days..."
              rows={6}
              maxLength={500}
            />

            <div
              className={`character-count ${
                description.length >= 450
                  ? "character-warning"
                  : ""
              }`}
            >
              {description.length}/500
            </div>

          </section>

          {/* ==============================
              05 SEVERITY
          ============================== */}

          <section className="form-section">

            <div className="form-heading">

              <div className="form-number">
                05
              </div>

              <div>
                <h2>
                  How serious is it?
                </h2>

                <p>
                  Choose the option that best matches the
                  situation.
                </p>
              </div>

            </div>

            <div className="severity-options">

              {/* LOW */}

              <button
                type="button"
                className={
                  severity === "Low"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSeverity("Low")
                }
              >

                <span className="severity-dot low"></span>

                <div>
                  <strong>
                    Low
                  </strong>

                  <small>
                    Minor concern
                  </small>
                </div>

              </button>

              {/* MEDIUM */}

              <button
                type="button"
                className={
                  severity === "Medium"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSeverity("Medium")
                }
              >

                <span className="severity-dot medium"></span>

                <div>
                  <strong>
                    Medium
                  </strong>

                  <small>
                    Needs attention
                  </small>
                </div>

              </button>

              {/* HIGH */}

              <button
                type="button"
                className={
                  severity === "High"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSeverity("High")
                }
              >

                <span className="severity-dot high"></span>

                <div>
                  <strong>
                    High
                  </strong>

                  <small>
                    Urgent concern
                  </small>
                </div>

              </button>

            </div>
          </section>

          {/* ==============================
              SUBMIT
          ============================== */}

          <div className="submit-area">

            <div className="privacy-note">

              <ShieldAlert size={17} />

              <span>
                Your information will only be used to
                process this report.
              </span>

            </div>

            <button
              type="submit"
              className="submit-report"
            >
              Submit Report
              <Send size={18} />
            </button>

          </div>

        </form>
      </main>
    </div>
  );
}

export default ReportIssue;