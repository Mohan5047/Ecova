import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Leaf,
  Menu,
  X,
  ArrowRight,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { storageService } from "../services/storageService";
import type { Notification } from "../types";
import NotificationPanel from "./NotificationPanel";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const refreshNotifications = () => {
    const list = storageService.getNotifications(user?.id);
    setNotifications(list);
  };

  useEffect(() => {
    const list = storageService.getNotifications(user?.id);
    setNotifications(list);
  }, [user]);

  const closeMenu = () => {
    setMenuOpen(false);
    setNotifOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    storageService.markAllNotificationsAsRead(user?.id);
    refreshNotifications();
  };

  const handleNotificationClick = (notifId: string) => {
    storageService.markNotificationAsRead(notifId);
    refreshNotifications();
  };

  const getDashboardRoute = () => {
    if (!user) return "/dashboard";
    if (user.role === "authority") return "/authority";
    if (user.role === "admin") return "/admin";
    return "/dashboard";
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          {/* LOGO */}
          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-icon">
              <Leaf size={20} />
            </span>
            <span>ECOVA</span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="nav-links desktop-links">
            <Link
              to="/"
              className={location.pathname === "/" ? "active-link" : ""}
            >
              Home
            </Link>

            <a href="/#how-it-works">How it works</a>

            <a href="/#issues">Issues</a>

            <a href="/#about">About</a>

            <Link
              to="/tracking"
              className={location.pathname === "/tracking" ? "active-link" : ""}
            >
              <Search size={15} style={{ marginRight: 4 }} />
              Track Report
            </Link>

            {isAuthenticated && (
              <Link
                to={getDashboardRoute()}
                className={
                  location.pathname === getDashboardRoute() ? "active-link" : ""
                }
              >
                <LayoutDashboard size={15} style={{ marginRight: 4 }} />
                {user?.role === "authority"
                  ? "Authority Portal"
                  : user?.role === "admin"
                  ? "Admin Console"
                  : "Dashboard"}
              </Link>
            )}
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="nav-actions">
            {/* NOTIFICATIONS BELL */}
            {isAuthenticated && (
              <div className="notif-wrapper">
                <button
                  type="button"
                  className="nav-icon-button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                </button>
              </div>
            )}

            {/* AUTH ACTIONS */}
            {isAuthenticated ? (
              <div className="auth-menu">
                <Link
                  to="/profile"
                  className="user-profile-btn"
                  title={`${user?.name} (${user?.role})`}
                >
                  <span className="user-avatar-badge">
                    {user?.role === "authority" ? (
                      <Building2 size={13} />
                    ) : user?.role === "admin" ? (
                      <ShieldCheck size={13} />
                    ) : (
                      <UserIcon size={13} />
                    )}
                  </span>
                  <span className="user-name-short">
                    {user?.name.split(" ")[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  className="nav-logout-btn"
                  onClick={logout}
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-signin-link">
                Sign In
              </Link>
            )}

            {/* DESKTOP REPORT BUTTON */}
            <Link to="/report" className="desktop-report">
              Report an Issue
              <ArrowRight size={17} />
            </Link>

            {/* MOBILE MENU TOGGLE */}
            <button
              className="menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {menuOpen && (
          <div className="mobile-dropdown-menu">
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>
            <a href="/#how-it-works" onClick={closeMenu}>
              How it works
            </a>
            <a href="/#issues" onClick={closeMenu}>
              Issues
            </a>
            <a href="/#about" onClick={closeMenu}>
              About
            </a>
            <Link to="/tracking" onClick={closeMenu}>
              <Search size={16} />
              Track a Report
            </Link>

            {isAuthenticated ? (
              <>
                <Link to={getDashboardRoute()} onClick={closeMenu}>
                  <LayoutDashboard size={16} />
                  {user?.role === "authority"
                    ? "Authority Portal"
                    : user?.role === "admin"
                    ? "Admin Console"
                    : "Citizen Dashboard"}
                </Link>
                <Link to="/reports" onClick={closeMenu}>
                  My Reports
                </Link>
                <Link to="/profile" onClick={closeMenu}>
                  <UserIcon size={16} />
                  Profile ({user?.name})
                </Link>
                <button
                  type="button"
                  className="mobile-logout-btn"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu}>
                Sign In / Register
              </Link>
            )}

            <Link to="/report" className="mobile-report" onClick={closeMenu}>
              Report an Issue
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </nav>

      {/* NOTIFICATION PANEL POPOVER */}
      <NotificationPanel
        isOpen={notifOpen}
        notifications={notifications}
        onClose={() => setNotifOpen(false)}
        onMarkAllRead={handleMarkAllRead}
        onNotificationClick={handleNotificationClick}
      />
    </>
  );
}

export default Navbar;