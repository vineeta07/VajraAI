import { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import { RiskPieChart, RiskBarChart } from '../components/Charts';
import {
    Activity,
    AlertTriangle,
    DollarSign,
    FileText,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [overview, setOverview] = useState(null);
    const [riskDist, setRiskDist] = useState(null);
    const [topVendors, setTopVendors] = useState([]);
    const [recentAnomalies, setRecentAnomalies] = useState([]);
    const [deptStats, setDeptStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overviewRes, riskRes, vendorsRes, recentRes, deptRes] = await Promise.all([
                    axios.get('/api/dashboard/overview'),
                    axios.get('/api/dashboard/risk-distribution'),
                    axios.get('/api/dashboard/top-vendors'),
                    axios.get('/api/dashboard/recent-anomalies'),
                    axios.get('/api/dashboard/department-stats')
                ]);

                setOverview(overviewRes.data);

                // Format risk dist for chart
                const distData = [
                    { name: 'Low', value: riskRes.data.LOW || 0 },
                    { name: 'Medium', value: riskRes.data.MEDIUM || 0 },
                    { name: 'High', value: riskRes.data.HIGH || 0 },
                ];
                setRiskDist(distData);
                setTopVendors(vendorsRes.data);
                setRecentAnomalies(recentRes.data);

                // Format department stats for bar chart
                const deptData = deptRes.data.map(d => ({
                    name: d.department,
                    value: Number(d.total_risk_amount)
                }));
                setDeptStats(deptData);

            } catch (error) {
                console.error("Error loading dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-4">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>

            {overview && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Transactions"
                        value={overview.total_transactions}
                        icon={FileText}
                        color="indigo"
                    />
                    <StatCard
                        title="Flagged Transactions"
                        value={overview.flagged_transactions}
                        icon={AlertTriangle}
                        color="yellow"
                    />
                    <StatCard
                        title="High Risk"
                        value={overview.high_risk_transactions}
                        icon={Activity}
                        color="red"
                    />
                    <StatCard
                        title="Amount at Risk"
                        value={`$${overview.amount_at_risk.toLocaleString()}`}
                        icon={DollarSign}
                        color="red"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution */}
                <div className="bg-white p-6 shadow rounded-lg">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Risk Distribution</h3>
                    {riskDist && <RiskPieChart data={riskDist} />}
                </div>

                {/* Risk by Department */}
                <div className="bg-white p-6 shadow rounded-lg">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Risk Amount by Department</h3>
                    {deptStats && <RiskBarChart data={deptStats} />}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Suspicious Vendors */}
                <div className="bg-white p-6 shadow rounded-lg">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Suspicious Vendors</h3>
                    <div className="flow-root">
                        <ul className="-my-5 divide-y divide-gray-200">
                            {topVendors.map((vendor, idx) => (
                                <li key={idx} className="py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {vendor.vendor_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {vendor.flagged_transactions} flagged transactions
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                            ${Number(vendor.total_amount).toLocaleString()}
                                        </div>
                                        <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vendor.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {vendor.risk_level}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Recent Anomalies */}
                <div className="bg-white p-6 shadow rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Anomalies</h3>
                        <Link to="/anomalies" className="text-sm text-indigo-600 hover:text-indigo-500">View all</Link>
                    </div>
                    <div className="flow-root">
                        <ul className="-my-5 divide-y divide-gray-200">
                            {recentAnomalies.map((item, idx) => (
                                <li key={idx} className="py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <Clock className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {item.vendor_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(item.detected_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                            ${Number(item.amount).toLocaleString()}
                                        </div>
                                        <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' : (item.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')}`}>
                                            {item.risk_level}
                                        </div>
                                        <Link to={`/anomalies/${item.transaction_id}`} className="text-gray-400 hover:text-gray-500">
                                            <span className="sr-only">View</span>
                                            &rarr;
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
