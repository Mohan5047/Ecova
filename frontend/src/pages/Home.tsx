import Navbar from "../components/Navbar";
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
} from "lucide-react";
import "./../App.css";

function Home() {
  const issues = [
    {
      icon: Recycle,
      title: "Waste & Garbage",
      text: "Report illegal dumping, overflowing bins, and waste accumulation.",
    },
    {
      icon: Droplets,
      title: "Water Issues",
      text: "Help identify polluted water, leaks, and unhealthy water surroundings.",
    },
    {
      icon: Leaf,
      title: "Pollution",
      text: "Report unusual smoke, pollution, and other environmental concerns.",
    },
    {
      icon: TreePine,
      title: "Nature & Greenery",
      text: "Report environmental damage and problems affecting green spaces.",
    },
  ];

  return (
    
    <div className="ecova">
        <Navbar />
      {/* HERO */}
      <main id="home">
        <section className="hero-section">
          <div className="hero-glow glow-one"></div>
          <div className="hero-glow glow-two"></div>

          <div className="hero-container">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="hero-badge">
                <span></span>
                Building a cleaner India, together
              </div>

              <h1>
                See a problem.
                <br />
                <span>Make a difference.</span>
              </h1>

              <p>
                ECOVA connects people with the right authorities to report,
                track, and resolve environmental and civic problems around
                them.
              </p>

              <div className="hero-buttons">
                <button className="primary-button">
                  <Camera size={19} />
                  Report an Issue
                  <ArrowRight size={18} />
                </button>

                <a href="#how-it-works" className="secondary-button">
                  How ECOVA works
                </a>
              </div>

              <div className="trust-row">
                <div>
                  <CheckCircle2 size={18} />
                  Easy reporting
                </div>

                <div>
                  <MapPin size={18} />
                  Location based
                </div>

                <div>
                  <ShieldCheck size={18} />
                  Privacy focused
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
              <div className="visual-circle circle-back"></div>
              <div className="visual-circle circle-front"></div>

              <div className="eco-card main-card">
                <div className="card-top">
                  <div className="location-icon">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <small>Nearby issue</small>
                    <strong>Waste accumulation</strong>
                  </div>

                  <span className="status-dot"></span>
                </div>

                <div className="fake-map">
                  <div className="map-line line-one"></div>
                  <div className="map-line line-two"></div>
                  <div className="map-line line-three"></div>

                  <motion.div
                    className="map-pin pin-one"
                    animate={{ y: [0, -7, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <MapPin size={25} />
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
                    <small>Community impact</small>
                    <strong>12 people reported this area</strong>
                  </div>

                  <span className="impact-badge">High</span>
                </div>
              </div>

              {/* FLOATING REPORT CARD */}
              <motion.div
                className="floating-card report-card"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                <div className="floating-icon">
                  <Camera size={19} />
                </div>

                <div>
                  <strong>Report in seconds</strong>
                  <span>Photo + location</span>
                </div>
              </motion.div>

              {/* FLOATING RESOLVED CARD */}
              <motion.div
                className="floating-card resolved-card"
                animate={{ y: [0, 9, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                }}
              >
                <CheckCircle2 size={21} />

                <div>
                  <strong>Issue resolved</strong>
                  <span>Community notified</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="section">
          <div className="section-heading">
            <span className="section-label">HOW ECOVA WORKS</span>

            <h2>
              From noticing a problem to seeing it resolved.
            </h2>

            <p>
              Reporting shouldn't be complicated. ECOVA keeps the entire
              process simple and transparent.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <span className="step-number">01</span>

              <div className="step-icon">
                <Camera />
              </div>

              <h3>Report</h3>

              <p>
                Capture the problem with a photo and a simple description.
              </p>
            </div>

            <div className="step-line"></div>

            <div className="step">
              <span className="step-number">02</span>

              <div className="step-icon">
                <MapPin />
              </div>

              <h3>Locate</h3>

              <p>
                Your location helps ECOVA identify the right authority.
              </p>
            </div>

            <div className="step-line"></div>

            <div className="step">
              <span className="step-number">03</span>

              <div className="step-icon">
                <ShieldCheck />
              </div>

              <h3>Connect</h3>

              <p>
                The report reaches the responsible department or head.
              </p>
            </div>

            <div className="step-line"></div>

            <div className="step">
              <span className="step-number">04</span>

              <div className="step-icon">
                <CheckCircle2 />
              </div>

              <h3>Restore</h3>

              <p>
                Track the action until the issue is properly resolved.
              </p>
            </div>
          </div>
        </section>

        {/* ISSUES */}
        <section id="issues" className="issues-section">
          <div className="section-heading left-heading">
            <span className="section-label">WHAT CAN YOU REPORT?</span>

            <h2>
              If it affects your surroundings, ECOVA can help.
            </h2>

            <p>
              Start with the problems people see every day. More categories
              can be added as ECOVA grows.
            </p>
          </div>

          <div className="issue-grid">
            {issues.map((issue, index) => {
              const Icon = issue.icon;

              return (
                <motion.div
                  className="issue-card"
                  key={issue.title}
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: index * 0.1,
                  }}
                >
                  <div className="issue-icon">
                    <Icon size={24} />
                  </div>

                  <h3>{issue.title}</h3>

                  <p>{issue.text}</p>

                  <button>
                    Report
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* IMPACT / VISION */}
        <section className="impact-section">
          <div className="impact-content">
            <span className="section-label">OUR VISION</span>

            <h2>
              Cleaner surroundings.
              <br />
              <span>Safer communities.</span>
            </h2>

            <p>
              ECOVA is built around one simple belief: when people have an
              easy way to speak up and authorities have the right information
              to act, communities can become better places to live.
            </p>

            <button className="primary-button">
              Join the movement
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="impact-orbit">
            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>

            <div className="orbit-center">
              <Leaf size={42} />

              <strong>ECOVA</strong>

              <span>Report • Respond • Restore</span>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="about-section">
          <div>
            <span className="section-label">WHY ECOVA?</span>

            <h2>
              Technology that turns concern into action.
            </h2>
          </div>

          <p>
            From a small street to a whole city, ECOVA aims to create a
            transparent connection between citizens, communities and the
            people responsible for making improvements.
          </p>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">
          <span className="logo-icon">
            <Leaf size={18} />
          </span>

          ECOVA
        </div>

        <p>Cleaner. Safer. Together. 🇮🇳</p>

        <span>© 2026 ECOVA</span>
      </footer>
    </div>
  );
}

export default Home;