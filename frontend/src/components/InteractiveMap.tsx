import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Report } from '../types';

interface InteractiveMapProps {
  mode: 'explorer' | 'picker' | 'viewer';
  center?: [number, number];
  zoom?: number;
  reports?: Report[];
  selectedLocation?: { latitude: number; longitude: number } | null;
  onLocationSelect?: (coords: { latitude: number; longitude: number }) => void;
  height?: string;
  className?: string;
}

// Helper to generate modern SVG pin markers
function createCustomMarkerIcon(status?: string, isPicker = false) {
  let color = '#0f5132'; // Default dark green

  if (isPicker) {
    color = '#059669'; // Emerald
  } else {
    switch (status) {
      case 'Submitted':
        color = '#d97706'; // Amber
        break;
      case 'Under Review':
        color = '#2563eb'; // Blue
        break;
      case 'Action Taken':
        color = '#7c3aed'; // Purple
        break;
      case 'Resolved':
        color = '#10b981'; // Emerald
        break;
      default:
        color = '#0f5132';
    }
  }

  const svgHtml = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      cursor: pointer;
    ">
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        background: ${color};
        opacity: 0.22;
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
      <div style="
        width: 22px;
        height: 22px;
        background: ${color};
        border: 2.5px solid #ffffff;
        box-shadow: 0 3px 8px rgba(0,0,0,0.28);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  mode,
  center = [12.9716, 77.5946], // Default Bengaluru coordinates
  zoom = 13,
  reports = [],
  selectedLocation,
  onLocationSelect,
  height = '420px',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization if map already exists
    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = selectedLocation
        ? [selectedLocation.latitude, selectedLocation.longitude]
        : center;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // Free OpenStreetMap CartoDB Positron / OSM standard tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle map clicks in picker mode
      if (mode === 'picker' && onLocationSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          onLocationSelect({ latitude: lat, longitude: lng });
        });
      }
    }

    const map = mapInstanceRef.current;

    // In picker mode, render draggable pin
    if (mode === 'picker') {
      if (selectedLocation) {
        const markerPos: [number, number] = [
          selectedLocation.latitude,
          selectedLocation.longitude,
        ];

        if (!pickerMarkerRef.current) {
          const marker = L.marker(markerPos, {
            icon: createCustomMarkerIcon(undefined, true),
            draggable: true,
          }).addTo(map);

          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            if (onLocationSelect) {
              onLocationSelect({ latitude: pos.lat, longitude: pos.lng });
            }
          });

          pickerMarkerRef.current = marker;
        } else {
          pickerMarkerRef.current.setLatLng(markerPos);
        }

        map.setView(markerPos, Math.max(map.getZoom(), 15));
      }
    }

    // In viewer mode, render single pinned report
    if (mode === 'viewer') {
      const viewerCenter: [number, number] = selectedLocation
        ? [selectedLocation.latitude, selectedLocation.longitude]
        : center;

      L.marker(viewerCenter, {
        icon: createCustomMarkerIcon(reports[0]?.status || 'Submitted'),
      }).addTo(map);

      map.setView(viewerCenter, 15);
    }

    // In explorer mode, render all reports
    if (mode === 'explorer' && reports.length > 0) {
      // Clear previous markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      const bounds = L.latLngBounds([]);

      reports.forEach((report) => {
        if (!report.latitude || !report.longitude) return;

        const pos: [number, number] = [report.latitude, report.longitude];
        bounds.extend(pos);

        const marker = L.marker(pos, {
          icon: createCustomMarkerIcon(report.status),
        }).addTo(map);

        const popupContent = `
          <div style="font-family: 'DM Sans', sans-serif; min-width: 200px; padding: 4px;">
            ${
              report.photoUrl
                ? `<div style="height: 100px; width: 100%; border-radius: 6px; overflow: hidden; margin-bottom: 8px;">
                     <img src="${report.photoUrl}" alt="Issue Evidence" style="width: 100%; height: 100%; object-fit: cover;" />
                   </div>`
                : ''
            }
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 700; color: #0f5132; background: #e8f5e9; padding: 2px 6px; border-radius: 4px;">
                ${report.id}
              </span>
              <span style="font-size: 11px; font-weight: 600; color: #495057;">
                ${report.status}
              </span>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; margin: 4px 0; color: #212529;">
              ${report.category}
            </h4>
            <p style="font-size: 12px; color: #6c757d; margin: 0 0 10px 0; line-height: 1.4;">
              ${report.description.slice(0, 80)}${report.description.length > 80 ? '...' : ''}
            </p>
            <a href="/tracking?id=${report.id}" style="
              display: block;
              text-align: center;
              background: #0f5132;
              color: white;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
              text-decoration: none;
            ">Track Progress &rarr;</a>
          </div>
        `;

        marker.bindPopup(popupContent);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }

    return () => {
      // Clean up map instance on component unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        pickerMarkerRef.current = null;
      }
    };
  }, [mode, selectedLocation, reports]);

  return (
    <div
      className={`interactive-map-wrapper ${className}`}
      style={{
        width: '100%',
        height,
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {mode === 'picker' && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#1e293b',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          <span>📍 Click or drag pin to adjust exact location</span>
          {selectedLocation && (
            <span style={{ fontWeight: 600, color: '#0f5132' }}>
              {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
