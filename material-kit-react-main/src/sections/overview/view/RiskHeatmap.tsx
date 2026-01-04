import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from 'react-leaflet';

import { DELHI_WARDS_GEOJSON } from '../../product/constants';

const getColor = (d: number) => (
  d > 80 ? '#ef4444' :
  d > 60 ? '#f97316' :
  d > 40 ? '#eab308' :
  d > 20 ? '#4ade80' :
           '#22c55e'
);

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 12, { duration: 1.5 });
  }, [center, map]);
  return null;
};

const RiskHeatmap: React.FC = () => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.7041, 77.1025]);
  const [selectedWard, setSelectedWard] = useState<any>(null);

  const geoJsonStyle = (feature: any) => ({
    fillColor: getColor(feature.properties.riskScore),
    weight: 1,
    opacity: 1,
    color: '#fff',
    fillOpacity: 0.6,
  });

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => e.target.setStyle({ fillOpacity: 0.8, weight: 2 }),
      mouseout: (e: any) => e.target.setStyle({ fillOpacity: 0.6, weight: 1 }),
      click: (e: any) => {
        setMapCenter([e.latlng.lat, e.latlng.lng]);
        setSelectedWard(feature.properties);
      },
    });
  };

  return (
    <div className="w-full h-[500px] bg-white rounded-3xl overflow-hidden relative shadow-lg border border-gray-200">
      <div className="absolute top-6 left-6 z-[1000] p-5 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
        <h4 className="font-bold text-sm mb-4 text-gray-800">Risk Heatmap</h4>
        <div className="space-y-3">
          {[
            { label: 'Critical', color: 'bg-red-500', range: '80-100%' },
            { label: 'High', color: 'bg-orange-500', range: '60-80%' },
            { label: 'Warning', color: 'bg-yellow-500', range: '40-60%' },
            { label: 'Moderate', color: 'bg-green-400', range: '20-40%' },
            { label: 'Stable', color: 'bg-green-500', range: '0-20%' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-md ${item.color} shadow-sm`} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                <span className="text-[10px] text-gray-500">{item.range}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <GeoJSON data={DELHI_WARDS_GEOJSON as any} style={geoJsonStyle} onEachFeature={onEachFeature} />
        <MapController center={mapCenter} />
        {selectedWard && (
          <Popup position={mapCenter}>
            <div className="p-2 min-w-[160px]">
              <h5 className="font-bold border-b pb-2 mb-2 text-gray-800">{selectedWard.name}</h5>
              <p className="text-xs mb-1">
                Risk: <span className="font-bold text-red-500">{selectedWard.riskScore}%</span>
              </p>
              <p className="text-xs">
                Blocked: <span className="font-bold text-emerald-600">₹{(selectedWard.savings / 100000).toFixed(1)}L</span>
              </p>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
};

export default RiskHeatmap;
