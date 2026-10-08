import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ThumbsUp,
  Map as MapIcon,
  LayoutGrid,
  Plus,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import InteractiveMap from '../components/InteractiveMap';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Report } from '../types';
import '../App.css';

export function CommunityIssues() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [upvotingId, setUpvotingId] = useState<string | null>(null);

  const categories = [
    'ALL',
    'Waste & Garbage',
    'Water Issue',
    'Pollution',
    'Nature & Greenery',
    'Public Surroundings',
    'Other',
  ];

  const statuses = ['ALL', 'Submitted', 'Under Review', 'Action Taken', 'Resolved'];

  useEffect(() => {
    let isMounted = true;
    async function fetchReports() {
      setLoading(true);
      try {
        const data = await api.getReports();
        if (isMounted) setReports(data);
      } catch (err) {
        console.error('Failed to load community reports:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchReports();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpvote = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setUpvotingId(reportId);
    try {
      const res = await api.toggleUpvote(reportId);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, upvotes: res.upvotes, hasUpvoted: res.upvoted }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
    } finally {
      setUpvotingId(null);
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.address && r.address.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'ALL' || r.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'ALL' || r.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [reports, searchTerm, selectedCategory, selectedStatus]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="report-page community-issues-page">
      <Navbar />

      <main className="report-container issues-explorer-container">
        {/* PAGE HEADER */}
        <div className="issues-header-banner">
          <div>
            <span className="section-badge">COMMUNITY DIRECTORY</span>
            <h1>Explore Civic Issues</h1>
            <p>
              Browse active environmental and civic concerns reported by citizens across your region.
              Validate community reports with an upvote to elevate authority prioritization.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/report')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} />
            Report New Issue
          </button>
        </div>

        {/* CONTROLS BAR: SEARCH, VIEW TOGGLE, FILTERS */}
        <div className="issues-controls-card">
          <div className="search-and-toggle-row">
            {/* SEARCH */}
            <div className="search-input-wrapper" style={{ flex: 1, maxWidth: '520px' }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by ID, keyword, street, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                >
                  &times;
                </button>
              )}
            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="view-mode-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Cards Grid View"
              >
                <LayoutGrid size={16} />
                <span>Cards</span>
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
                title="Interactive Map View"
              >
                <MapIcon size={16} />
                <span>Live Map</span>
              </button>
            </div>
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="category-filter-scroll">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* STATUS FILTER PILLS */}
          <div className="status-pill-tabs" style={{ marginTop: '10px' }}>
            {statuses.map((st) => (
              <button
                key={st}
                type="button"
                className={`status-pill ${selectedStatus === st ? 'active' : ''}`}
                onClick={() => setSelectedStatus(st)}
              >
                {st === 'ALL' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT SECTION */}
        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner message="Loading live community reports..." />
          </div>
        ) : filteredReports.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No community issues matched your criteria"
            description="Try clearing your search query or adjusting your category/status filters."
            actionText="Clear All Filters"
            onAction={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
            }}
          />
        ) : viewMode === 'map' ? (
          /* MAP VIEW */
          <div className="community-map-view-wrapper">
            <InteractiveMap
              mode="explorer"
              reports={filteredReports}
              height="580px"
            />
            <div className="map-legend-bar">
              <span className="legend-item"><span className="legend-dot" style={{ background: '#d97706' }} /> Submitted</span>
              <span className="legend-item"><span className="legend-dot" style={{ background: '#2563eb' }} /> Under Review</span>
              <span className="legend-item"><span className="legend-dot" style={{ background: '#7c3aed' }} /> Action Taken</span>
              <span className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} /> Resolved</span>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="reports-card-grid">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="user-report-card community-card"
                onClick={() => navigate(`/tracking?id=${report.id}`)}
              >
                {/* PHOTO PREVIEW */}
                {report.photoUrl && (
                  <div className="community-card-thumbnail">
                    <img src={report.photoUrl} alt={report.category} loading="lazy" />
                    <span className="card-severity-tag" data-severity={report.severity.toLowerCase()}>
                      {report.severity} Priority
                    </span>
                  </div>
                )}

                <div className="user-report-header" style={{ marginTop: report.photoUrl ? '10px' : '0' }}>
                  <div className="user-report-id">
                    <strong>{report.id}</strong>
                    <span className="report-category-pill">{report.category}</span>
                  </div>
                  <StatusBadge status={report.status} />
                </div>

                <p className="user-report-desc">{report.description}</p>

                {report.address && (
                  <div className="user-report-meta" style={{ marginTop: '8px' }}>
                    <MapPin size={14} />
                    <span className="report-address-truncate">{report.address}</span>
                  </div>
                )}

                <div className="community-card-footer">
                  <div className="card-timestamp">
                    <Calendar size={13} />
                    <span>{formatDate(report.createdAt)}</span>
                  </div>

                  {/* UPVOTE BUTTON */}
                  <button
                    type="button"
                    className={`card-upvote-btn ${report.hasUpvoted ? 'upvoted' : ''}`}
                    onClick={(e) => handleUpvote(report.id, e)}
                    disabled={upvotingId === report.id}
                    title="Validate this civic report"
                  >
                    <ThumbsUp size={14} />
                    <span>{report.upvotes || 0}</span>
                  </button>
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

export default CommunityIssues;
