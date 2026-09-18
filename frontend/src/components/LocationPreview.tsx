import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface LocationPreviewProps {
  latitude: number;
  longitude: number;
  address?: string;
  height?: number;
}

export const LocationPreview: React.FC<LocationPreviewProps> = ({
  latitude,
  longitude,
  address,
  height = 180,
}) => {
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="location-preview-card">
      <div className="location-map-visual" style={{ height: `${height}px` }}>
        {/* Map stylized grid lines */}
        <div className="map-grid-overlay" />
        <div className="map-road-line road-1" />
        <div className="map-road-line road-2" />
        <div className="map-river" />

        {/* Central pulsing pin */}
        <div className="map-pin-pulse-container">
          <div className="map-pin-pulse" />
          <div className="map-pin-badge">
            <MapPin size={22} className="map-pin-icon" />
          </div>
        </div>

        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="map-external-badge"
          title="Open in Maps"
        >
          <span>View on Map</span>
          <ExternalLink size={12} />
        </a>
      </div>

      <div className="location-info-footer">
        <div className="location-coords">
          <MapPin size={15} className="location-icon-small" />
          <div>
            <strong>{address || 'Coordinates Detected'}</strong>
            <span>
              {latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPreview;
