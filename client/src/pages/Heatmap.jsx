import { useState, useEffect } from 'react';
import axios from 'axios';
import { RiskBarChart } from '../components/Charts';
import RiskMap from '../components/RiskMap';

export default function Heatmap() {
    const [locationData, setLocationData] = useState([]);
    const [deptData, setDeptData] = useState([]);
    const [timeData, setTimeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [riskFilter, setRiskFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = riskFilter ? { risk: riskFilter } : {};
                const [locRes, deptRes, timeRes] = await Promise.all([
                    axios.get('/api/heatmap/location', { params }),
                    axios.get('/api/heatmap/department', { params }),
                    axios.get('/api/heatmap/time', { params })
                ]);

                setLocationData(locRes.data.map(d => ({ name: d.location, value: Number(d.count) })));
                setDeptData(deptRes.data.map(d => ({ name: d.department, value: Number(d.count) })));
                setTimeData(timeRes.data.map(d => ({ name: new Date(d.date).toLocaleDateString(), value: Number(d.count) })));
            } catch (error) {
                console.error("Error fetching heatmap data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [riskFilter]);

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Risk Visualizations</h1>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <select
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="">All Risks</option>
                        <option value="HIGH">High Risk</option>
                        <option value="MEDIUM">Medium Risk</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div>Loading visualisations...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white p-6 shadow rounded-lg">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Geographic Risk Map</h3>
                        <RiskMap data={locationData} />
                    </div>

                    <div className="bg-white p-6 shadow rounded-lg">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Risk by Department</h3>
                        <RiskBarChart data={deptData} />
                    </div>

                    <div className="bg-white p-6 shadow rounded-lg">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Risk by Location</h3>
                        <RiskBarChart data={locationData} />
                    </div>

                    <div className="bg-white p-6 shadow rounded-lg">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Risk Over Time</h3>
                        <RiskBarChart data={timeData} />
                    </div>
                </div>
            )}
        </div>
    );
}
