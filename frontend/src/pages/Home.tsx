import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Droplets,
  Leaf,
  MapPin,
  Recycle,
  ShieldCheck,
  TreePine,
  Search,
  Users,
  Building,
  Sparkles,
  AlertTriangle,
  Clock,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { storageService } from "../services/storageService";
import "../App.css";

export function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalReports: 1428,
    underReview: 184,
    resolved: 1192,
    communities: 48,
  });

  useEffect(() => {
    try {
      const realStats = storageService.getStats();
      if (realStats.totalReports > 0) {
        setStats({
          totalReports: 1420 + realStats.totalReports,
          underReview: 180 + realStats.underReview,
          resolved: 1190 + realStats.resolved,
          communities: 48,
        });
      }
    } catch {
      // fallback to initial stats
    }
  }, []);

  const issues = [
    {
      id: "waste",
      categoryName: "Waste & Garbage",
      icon: Recycle,
      title: "Waste & Garbage",
      text: "Report illegal dumping, overflowing community bins, and hazardous litter accumulation.",
    },
    {
      id: "water",
      categoryName: "Water Issue",
      icon: Droplets,
      title: "Water Issues",
      text: "Help identify burst water pipelines, contaminated runoff, and urban waterlogging points.",
    },
    {
      id: "pollution",
      categoryName: "Pollution",
      icon: Leaf,
      title: "Pollution",
      text: "Report toxic smoke emissions, open burning, chemical runoff, and severe noise hazards.",
    },
    {
      id: "nature",
      categoryName: "Nature & Greenery",
      icon: TreePine,
      title: "Nature & Greenery",
      text: "Flag damaged green belts, dangerous dangling tree branches, and illegal tree felling.",
    },
    {
      id: "surroundings",
      categoryName: "Public Surroundings",
      icon: Building,
      title: "Public Surroundings",
      text: "Identify broken stormwater drains, missing manhole covers, and hazardous footpaths.",
    },
    {
      id: "other",
      categoryName: "Other",
      icon: AlertTriangle,
      title: "Other Concerns",
      text: "Any other urgent civic safety or environmental concern requiring municipal attention.",
    },
  ];

  return (
    <div className="ecova">
      <Navbar />

      {/* =========================================
          HERO SECTION
      ========================================= */}
      <main id="home">
        <section className="hero-section">
          <div className="hero-glow glow-one" />
          <div className="hero-glow glow-two" />

          <div className="hero-container">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="hero-badge">
                <span />
                Building cleaner, safer communities together
              </div>

              <h1>
                Help make your
                <br />
                <span>surroundings better.</span>
              </h1>

              <p>
                Report environmental and civic issues around you in seconds.
                ECOVA connects your observations directly with the authorities
                responsible for taking action.
              </p>

              <div className="hero-buttons">
                <Link to="/report" className="primary-button hero-cta-btn">
                  <Camera size={19} />
                  Report an Issue
                  <ArrowRight size={18} />
                </Link>

                <Link to="/tracking" className="secondary-button hero-track-btn">
                  <Search size={18} />
                  Track a Report
                </Link>
              </div>

              <div className="trust-row">
                <div>
                  <CheckCircle2 size={18} />
                  Easy photo reporting
                </div>
                <div>
                  <MapPin size={18} />
                  Precise GPS locating
                </div>
                <div>
                  <ShieldCheck size={18} />
                  Direct authority routing
                </div>
              </div>
            </motion.div>

            {/* HERO VISUAL */}
            <motion.div
              className="hero-visual"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15 }}
            >
              <div className="visual-circle circle-back" />
              <div className="visual-circle circle-front" />

              <div className="eco-card main-card">
                <div className="card-top">
                  <div className="location-icon">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <small>Active Civic Report</small>
                    <strong>Waste Accumulation • Indiranagar</strong>
                  </div>
                  <span className="status-dot" title="Under Review" />
                </div>

                <div className="fake-map">
                  <div className="map-line line-one" />
                  <div className="map-line line-two" />
                  <div className="map-line line-three" />

                  <motion.div
                    className="map-pin pin-one"
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MapPin size={26} />
                  </motion.div>

                  <div className="map-pin pin-two">
                    <MapPin size={20} />
                  </div>

                  <div className="map-pin pin-three">
                    <MapPin size={20} />
                  </div>
                </div>

                <div className="card-bottom">
                  <div>
                    <small>Status Update</small>
                    <strong>Sanitation Supervisor Dispatched</strong>
                  </div>
                  <span className="impact-badge">Priority</span>
                </div>
              </div>

              {/* FLOATING REPORT CARD */}
              <motion.div
                className="floating-card report-card"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="floating-icon">
                  <Camera size={19} />
                </div>
                <div>
                  <strong>Report in seconds</strong>
                  <span>Photo + Location pin</span>
                </div>
              </motion.div>

              {/* FLOATING RESOLVED CARD */}
              <motion.div
                className="floating-card resolved-card"
                animate={{ y: [0, 9, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
              >
                <CheckCircle2 size={21} />
                <div>
                  <strong>Issue Resolved</strong>
                  <span>Community notified</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* =========================================
            IMPACT / STATS SECTION
        ========================================= */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Camera size={24} />
              </div>
              <div className="stat-number">{stats.totalReports.toLocaleString()}+</div>
              <div className="stat-label">Issues Reported</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-review">
                <Clock size={24} />
              </div>
              <div className="stat-number">{stats.underReview.toLocaleString()}+</div>
              <div className="stat-label">Under Active Review</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-resolved">
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-number">{stats.resolved.toLocaleString()}+</div>
              <div className="stat-label">Issues Resolved</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-community">
                <Users size={24} />
              </div>
              <div className="stat-number">{stats.communities}+</div>
              <div className="stat-label">Communities Reached</div>
            </div>
          </div>
        </section>

        {/* =========================================
            HOW IT WORKS
        ========================================= */}
        <section id="how-it-works" className="section">
          <div className="section-heading">
            <span className="section-label">HOW ECOVA WORKS</span>
            <h2>From noticing a problem to seeing it resolved.</h2>
            <p>
              Reporting shouldn't be complicated. ECOVA keeps the entire
              civic reporting process simple, transparent, and trackable.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <span className="step-number">01</span>
              <div className="step-icon">
                <Camera />
              </div>
              <h3>Spot an Issue</h3>
              <p>Capture the problem with a clear photo and a short description.</p>
            </div>

            <div className="step-line" />

            <div className="step">
              <span className="step-number">02</span>
              <div className="step-icon">
                <MapPin />
              </div>
              <h3>Share Location</h3>
              <p>One tap pinpoints GPS coordinates to map the issue precisely.</p>
            </div>

            <div className="step-line" />

            <div className="step">
              <span className="step-number">03</span>
              <div className="step-icon">
                <ShieldCheck />
              </div>
              <h3>Authority Reviews</h3>
              <p>The report automatically routes to the right municipal department.</p>
            </div>

            <div className="step-line" />

            <div className="step">
              <span className="step-number">04</span>
              <div className="step-icon">
                <CheckCircle2 />
              </div>
              <h3>Action & Resolution</h3>
              <p>Follow live progress until field teams resolve the problem.</p>
            </div>
          </div>
        </section>

        {/* =========================================
            ISSUE CATEGORIES
        ========================================= */}
        <section id="issues" className="issues-section">
          <div className="section-heading left-heading">
            <span className="section-label">WHAT CAN YOU REPORT?</span>
            <h2>If it affects your surroundings, ECOVA can help.</h2>
            <p>
              Choose a category below to submit a focused report directly to
              the relevant municipal wing.
            </p>
          </div>

          <div className="issue-grid">
            {issues.map((issue, index) => {
              const Icon = issue.icon;

              return (
                <motion.div
                  className="issue-card"
                  key={issue.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <div className="issue-icon">
                    <Icon size={24} />
                  </div>

                  <h3>{issue.title}</h3>
                  <p>{issue.text}</p>

                  <button
                    type="button"
                    className="issue-card-btn"
                    onClick={() =>
                      navigate(
                        `/report?category=${encodeURIComponent(
                          issue.categoryName
                        )}`
                      )
                    }
                  >
                    Report this
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* =========================================
            WHY ECOVA / VALUE PROPOSITION
        ========================================= */}
        <section className="why-section">
          <div className="why-container">
            <div className="section-heading">
              <span className="section-label">WHY CITIZENS CHOOSE ECOVA</span>
              <h2>Technology designed to bridge the gap between people and authorities.</h2>
            </div>

            <div className="why-grid">
              <div className="why-card">
                <div className="why-icon-box">
                  <Camera size={22} />
                </div>
                <h4>Photographic Evidence</h4>
                <p>Images provide objective clarity, eliminating confusion and speeding up inspection times.</p>
              </div>

              <div className="why-card">
                <div className="why-icon-box">
                  <MapPin size={22} />
                </div>
                <h4>Precision Geolocation</h4>
                <p>Pinpoint coordinates guide repair crews straight to the scene without endless back-and-forth.</p>
              </div>

              <div className="why-card">
                <div className="why-icon-box">
                  <Clock size={22} />
                </div>
                <h4>Transparent Tracking</h4>
                <p>Unique Report IDs let you monitor status changes in real-time from review to on-site resolution.</p>
              </div>

              <div className="why-card">
                <div className="why-icon-box">
                  <ShieldCheck size={22} />
                </div>
                <h4>Direct Authority Routing</h4>
                <p>Reports reach verified civic wings, ward supervisors, and sanitation teams directly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            VISION SECTION
        ========================================= */}
        <section className="impact-section">
          <div className="impact-content">
            <span className="section-label">OUR VISION</span>
            <h2>
              Cleaner surroundings.
              <br />
              <span>Safer communities.</span>
            </h2>

            <p>
              "Cleaner surroundings start with noticing problems and making
              them visible." When every citizen has a simple way to speak up
              and authorities receive actionable data, small reports lead to
              meaningful, lasting improvements.
            </p>

            <Link to="/report" className="primary-button vision-cta-btn">
              <Sparkles size={18} />
              Start by Reporting an Issue
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="impact-orbit">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="orbit-center">
              <Leaf size={42} />
              <strong>ECOVA</strong>
              <span>Report • Respond • Restore</span>
            </div>
          </div>
        </section>

        {/* =========================================
            FINAL CALL TO ACTION
        ========================================= */}
        <section className="final-cta-section">
          <div className="final-cta-card">
            <span className="section-label" style={{ color: "#8be3a6" }}>
              TAKE ACTION TODAY
            </span>
            <h2>See something around you that needs attention?</h2>
            <p>
              Join thousands of conscious citizens helping improve local
              neighborhoods, green spaces, and public infrastructure.
            </p>
            <div className="final-cta-buttons">
              <Link to="/report" className="cta-light-button">
                <Camera size={18} />
                Report an Issue Now
              </Link>
              <Link to="/tracking" className="cta-outline-button">
                <Search size={18} />
                Track an Existing Report
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================
            ABOUT SECTION
        ========================================= */}
        <section id="about" className="about-section">
          <div>
            <span className="section-label">ABOUT ECOVA</span>
            <h2>Technology that turns concern into concrete action.</h2>
          </div>

          <p>
            From a localized residential street to an entire metropolis,
            ECOVA is dedicated to building transparent, accountable connections
            between citizens, municipal bodies, and sanitation leaders. Every
            report helps protect public health, preserve green environments,
            and foster civic pride.
          </p>
        </section>
      </main>

      {/* REUSABLE FOOTER */}
      <Footer />
    </div>
  );
}

export default Home;