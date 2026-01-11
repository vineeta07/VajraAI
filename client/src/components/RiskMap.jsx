import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Coordinates for demo locations
const CITY_COORDINATES = {
    "New York": [40.7128, -74.0060],
    "San Francisco": [37.7749, -122.4194],
    "Los Angeles": [34.0522, -118.2437],
    "London": [51.5074, -0.1278],
    "Paris": [48.8566, 2.3522],
    "Mumbai": [19.0760, 72.8777],
    "Delhi": [28.7041, 77.1025],
    "Bangalore": [12.9716, 77.5946],
    "Tokyo": [35.6762, 139.6503],
    "Sydney": [-33.8688, 151.2093],
    "Singapore": [1.3521, 103.8198],
    "Berlin": [52.5200, 13.4050],
    // Fallback for unknown
};

export default function RiskMap({ data }) {
    // Filter data to only include known locations and calculate max value for scaling
    const mapData = data
        .filter(d => CITY_COORDINATES[d.name])
        .map(d => ({
            ...d,
            coords: CITY_COORDINATES[d.name]
        }));

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm z-0 relative">
            <MapContainer
                center={[20.5937, 78.9629]} // Default center (Indiaish/Global)
                zoom={2}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapData.map((city, idx) => (
                    <CircleMarker
                        key={idx}
                        center={city.coords}
                        pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.6 }}
                        radius={Math.max(5, Math.min(city.value * 2, 30))} // Simple scaling
                    >
                        <Popup>
                            <div className="p-1">
                                <span className="font-bold">{city.name}</span>
                                <br />
                                Risk Count: {city.value}
                            </div>
                        </Popup>
                        <Tooltip>{city.name}: {city.value}</Tooltip>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
}
