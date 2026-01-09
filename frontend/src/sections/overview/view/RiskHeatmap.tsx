import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from 'react-leaflet';

import { DELHI_WARDS_GEOJSON } from '../../product/constants';

const getColor = (d: number) => {
  if (d > 80) return '#ef4444';  // Red for critical
  if (d > 60) return '#ffa726';  // Orange for high
  if (d > 40) return '#ffeb3b';  // Yellow for warning
  if (d > 20) return '#66bb6a';  // Light green for moderate
  return '#4caf50';              // Green for stable
};

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 11, { duration: 1.5 });
  }, [center, map]);
  return null;
};

const RiskHeatmap: React.FC = () => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.7041, 77.1025]);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [hoveredWard, setHoveredWard] = useState<string | null>(null);

  const geoJsonStyle = (feature: any) => {
    const isHovered = hoveredWard === feature.properties.name;
    return {
      fillColor: getColor(feature.properties.riskScore),
      weight: isHovered ? 3 : 2,
      opacity: 1,
      color: isHovered ? '#2196f3' : '#ffffff',
      fillOpacity: isHovered ? 0.85 : 0.7,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        setHoveredWard(feature.properties.name);
        e.target.setStyle({
          fillOpacity: 0.85,
          weight: 3,
          color: '#2196f3',
        });
      },
      mouseout: (e: any) => {
        setHoveredWard(null);
        e.target.setStyle({
          fillOpacity: 0.7,
          weight: 2,
          color: '#ffffff',
        });
      },
      click: (e: any) => {
        setMapCenter([e.latlng.lat, e.latlng.lng]);
        setSelectedWard(feature.properties);
      },
    });

    // Tooltip on hover
    layer.bindTooltip(
      `<div style="font-family: sans-serif; padding: 4px 8px;">
        <strong style="font-size: 13px; color: #333;">${feature.properties.name}</strong>
      </div>`,
      {
        permanent: false,
        sticky: true,
        className: 'custom-tooltip',
        direction: 'top',
        opacity: 0.95,
      }
    );
  };

  const legendItems = [
    { label: 'Critical', color: '#ef4444', range: '80-100%', textColor: '#dc2626' },
    { label: 'High', color: '#ffa726', range: '60-80%', textColor: '#c2410c' },
    { label: 'Warning', color: '#ffeb3b', range: '40-60%', textColor: '#a16207' },
    { label: 'Moderate', color: '#66bb6a', range: '20-40%', textColor: '#16a34a' },
    { label: 'Stable', color: '#4caf50', range: '0-20%', textColor: '#15803d' },
  ];

  return (
    <div style={{
      width: '100%',
      height: '600px',
      background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
      borderRadius: '24px',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Enhanced Legend Box */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        zIndex: 1000,
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        minWidth: '180px'
      }}>
        {/* Gradient Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg style={{ width: '18px', height: '18px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <h4 style={{ 
            fontWeight: 700, 
            fontSize: '14px', 
            color: 'white',
            margin: 0
          }}>
            Risk Heatmap
          </h4>
        </div>
        
        {/* Legend Items */}
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {legendItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Colored circle */}
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: item.color,
                boxShadow: `0 2px 4px ${item.color}40`,
                flexShrink: 0
              }} />
              
              {/* Text content */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: item.textColor,
                  lineHeight: 1.2
                }}>
                  {item.label}
                </span>
                <span style={{ 
                  fontSize: '10px', 
                  color: '#9ca3af',
                  fontWeight: 500
                }}>
                  {item.range}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <GeoJSON
          data={DELHI_WARDS_GEOJSON as any}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
          key={hoveredWard}
        />
        <MapController center={mapCenter} />
        {selectedWard && (
          <Popup
            position={mapCenter}
            closeButton
            maxWidth={280}
            minWidth={240}
          >
            <div style={{ padding: '16px', fontFamily: 'system-ui, sans-serif' }}>
              <h5 style={{ 
                fontWeight: 700, 
                fontSize: '18px', 
                borderBottom: '2px solid #6366f1',
                paddingBottom: '12px',
                marginBottom: '12px',
                color: '#111827',
                margin: 0,
                wordBreak: 'break-word'
              }}>
                {selectedWard.name}
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Risk Score:</span>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#ef4444' }}>
                    {selectedWard.riskScore}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Blocked Savings:</span>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#10b981' }}>
                    ₹{(selectedWard.savings / 100000).toFixed(1)}L
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Anomalies:</span>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#f97316' }}>
                    {selectedWard.anomalies}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
};

export default RiskHeatmap;
