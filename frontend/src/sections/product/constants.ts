
import { SchemeType, RiskStatus, RiskAnomaly } from './types';

// Simplified Delhi Wards Mock GeoJSON
export const DELHI_WARDS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "ward-01",
      properties: { name: "Narela", riskScore: 88, anomalies: 42, savings: 12000000 },
      geometry: { type: "Polygon", coordinates: [[[77.05, 28.85], [77.15, 28.85], [77.15, 28.75], [77.05, 28.75], [77.05, 28.85]]] }
    },
    {
      type: "Feature",
      id: "ward-02",
      properties: { name: "Burari", riskScore: 45, anomalies: 12, savings: 3400000 },
      geometry: { type: "Polygon", coordinates: [[[77.15, 28.85], [77.25, 28.85], [77.25, 28.75], [77.15, 28.75], [77.15, 28.85]]] }
    },
    {
      type: "Feature",
      id: "ward-03",
      properties: { name: "Adarsh Nagar", riskScore: 92, anomalies: 65, savings: 28000000 },
      geometry: { type: "Polygon", coordinates: [[[77.15, 28.75], [77.25, 28.75], [77.25, 28.65], [77.15, 28.65], [77.15, 28.75]]] }
    },
    {
      type: "Feature",
      id: "ward-04",
      properties: { name: "Rohini", riskScore: 32, anomalies: 8, savings: 1500000 },
      geometry: { type: "Polygon", coordinates: [[[77.05, 28.75], [77.15, 28.75], [77.15, 28.65], [77.05, 28.65], [77.05, 28.75]]] }
    },
    {
      type: "Feature",
      id: "ward-05",
      properties: { name: "Model Town", riskScore: 78, anomalies: 34, savings: 9500000 },
      geometry: { type: "Polygon", coordinates: [[[77.25, 28.85], [77.35, 28.85], [77.35, 28.75], [77.25, 28.75], [77.25, 28.85]]] }
    }
  ]
};

const SCHEMES = [SchemeType.PROCUREMENT, SchemeType.WELFARE, SchemeType.SPENDING];
const DISTRICTS = ["Narela", "Burari", "Adarsh Nagar", "Rohini", "Model Town", "Dwarka", "Janakpuri", "Vasant Kunj", "Saket"];
const REASONS = [
  "Repeated award to single bidder",
  "High variance from average cost",
  "Bidder shareholding overlap detected",
  "Short tender duration (under 48h)",
  "Ghost contractor identification",
  "Phantom employee salary diversion",
  "Incomplete work certified as 100%"
];

export const MOCK_RISKS: RiskAnomaly[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `risk-${i}`,
  tenderId: `TND-${1000 + i}`,
  score: Math.floor(Math.random() * 60) + 40,
  reason: REASONS[Math.floor(Math.random() * REASONS.length)],
  district: DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)],
  scheme: SCHEMES[Math.floor(Math.random() * SCHEMES.length)],
  amount: Math.floor(Math.random() * 5000000) + 100000,
  contractor: `Contractor ${String.fromCharCode(65 + (i % 26))}${i}`,
  timestamp: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
  status: RiskStatus.PENDING
}));

export const NETWORK_DATA = {
  nodes: [
    { id: "A", name: "Global Infra Ltd", type: "firm", val: 30, risk: 92 },
    { id: "B", name: "City Roads Corp", type: "firm", val: 20, risk: 40 },
    { id: "C", name: "Modern Build Co", type: "firm", val: 25, risk: 75 },
    { id: "T1", name: "Flyover Project X", type: "tender", val: 15, risk: 88 },
    { id: "T2", name: "Smart Sewerage", type: "tender", val: 12, risk: 20 },
    { id: "O1", name: "Dept Head 01", type: "official", val: 10 },
    { id: "O2", name: "Auditor 09", type: "official", val: 10 }
  ],
  links: [
    { source: "A", target: "T1", value: 5 },
    { source: "C", target: "T1", value: 2 },
    { source: "B", target: "T2", value: 8 },
    { source: "O1", target: "T1", value: 10 },
    { source: "O2", target: "T2", value: 10 },
    { source: "A", target: "C", value: 4 }
  ]
};
