import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Custom Pin Icon using SVG
const pinIcon = new L.DivIcon({
    className: 'custom-icon',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EF4444" stroke="#7F1D1D" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 drop-shadow-md"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Tip of the pin
    popupAnchor: [0, -32]
});

// Expanded Coordinates with Focus on India
const CITY_COORDINATES = {
    // India - Tier 1
    "Mumbai": [19.0760, 72.8777],
    "Delhi": [28.7041, 77.1025],
    "New Delhi": [28.6139, 77.2090],
    "Bangalore": [12.9716, 77.5946],
    "Bengaluru": [12.9716, 77.5946],
    "Hyderabad": [17.3850, 78.4867],
    "Chennai": [13.0827, 80.2707],
    "Kolkata": [22.5726, 88.3639],
    "Pune": [18.5204, 73.8567],
    "Ahmedabad": [23.0225, 72.5714],

    // India - Tier 2/3 & Major Hubs
    "Jaipur": [26.9124, 75.7873],
    "Lucknow": [26.8467, 80.9462],
    "Kanpur": [26.4499, 80.3319],
    "Nagpur": [21.1458, 79.0882],
    "Indore": [22.7196, 75.8577],
    "Thane": [19.2183, 72.9781],
    "Bhopal": [23.2599, 77.4126],
    "Visakhapatnam": [17.6868, 83.2185],
    "Bhubaneswar": [20.2961, 85.8245],
    "Patna": [25.5941, 85.1376],
    "Vadodara": [22.3072, 73.1812],
    "Ghaziabad": [28.6692, 77.4538],
    "Ludhiana": [30.9010, 75.8573],
    "Agra": [27.1767, 78.0081],
    "Nashik": [19.9975, 73.7898],
    "Ranchi": [23.3441, 85.3096],
    "Meerut": [28.9845, 77.7064],
    "Rajkot": [22.3039, 70.8022],
    "Varanasi": [25.3176, 82.9739],
    "Srinagar": [34.0837, 74.7973],
    "Aurangabad": [19.8762, 75.3433],
    "Dhanbad": [23.7957, 86.4304],
    "Amritsar": [31.6340, 74.8723],
    "Navi Mumbai": [19.0330, 73.0297],
    "Allahabad": [25.4358, 81.8463],
    "Prayagraj": [25.4358, 81.8463],
    "Howrah": [22.5958, 88.2636],
    "Jabalpur": [23.1815, 79.9864],
    "Gwalior": [26.2183, 78.1828],
    "Vijayawada": [16.5062, 80.6480],
    "Jodhpur": [26.2389, 73.0243],
    "Madurai": [9.9252, 78.1198],
    "Raipur": [21.2514, 81.6296],
    "Kota": [25.2138, 75.8648],
    "Guwahati": [26.1445, 91.7362],
    "Chandigarh": [30.7333, 76.7794],
    "Solapur": [17.6599, 75.9064],
    "Hubli": [15.3647, 75.1240],
    "Dharwad": [15.4589, 75.0078],
    "Bareilly": [28.3670, 79.4304],
    "Moradabad": [28.8386, 78.7733],
    "Mysore": [12.2958, 76.6394],
    "Gurgaon": [28.4595, 77.0266],
    "Gurugram": [28.4595, 77.0266],
    "Aligarh": [27.8974, 78.0880],
    "Jalandhar": [31.3260, 75.5762],
    "Tiruchirappalli": [10.7905, 78.7047],
    "Salem": [11.6643, 78.1460],
    "Warangal": [17.9689, 79.5941],
    "Thiruvananthapuram": [8.5241, 76.9366],
    "Trivandrum": [8.5241, 76.9366],
    "Kochi": [9.9312, 76.2673],
    "Cochin": [9.9312, 76.2673],
    "Noida": [28.5355, 77.3910],
    "Dehradun": [30.3165, 78.0322],
    "Coimbatore": [11.0168, 76.9558],
    "Surat": [21.1702, 72.8311]
};

export default function RiskMap({ data }) {
    const navigate = useNavigate();

    // Filter data to only include known locations
    const mapData = data
        .filter(d => CITY_COORDINATES[d.name])
        .map(d => ({
            ...d,
            coords: CITY_COORDINATES[d.name]
        }));

    const unmappedCities = data.filter(d => !CITY_COORDINATES[d.name]);

    return (
        <div className="flex flex-col space-y-2">
            <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm z-0 relative">
                <MapContainer
                    center={[20.5937, 78.9629]} // Default center (India)
                    zoom={3}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mapData.map((city, idx) => (
                        <Marker
                            key={idx}
                            position={city.coords}
                            icon={pinIcon}
                            eventHandlers={{
                                click: () => navigate(`/anomalies?location=${encodeURIComponent(city.name)}`),
                                mouseover: (e) => e.target.openPopup(),
                                mouseout: (e) => e.target.closePopup(),
                            }}
                        >
                            <Popup>
                                <div className="p-1 cursor-pointer" onClick={() => navigate(`/anomalies?location=${encodeURIComponent(city.name)}`)}>
                                    <span className="font-bold text-base">{city.name}</span>
                                    <br />
                                    <span className="text-gray-600">Flagged Cases:</span> <span className="font-bold text-red-600">{city.value}</span>
                                    <br />
                                    <span className="text-xs text-indigo-600 font-semibold mt-1 inline-block">Click for details &rarr;</span>
                                </div>
                            </Popup>
                            <Tooltip>{city.name}: {city.value} cases</Tooltip>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
            {unmappedCities.length > 0 && (
                <div className="text-sm text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-100">
                    <strong>Note:</strong> Some locations could not be placed on the map: {unmappedCities.map(c => c.name).join(', ')}.
                </div>
            )}
        </div>
    );
}
