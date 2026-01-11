import { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import { RiskPieChart } from '../components/Charts';
import {
    Activity,
    AlertTriangle,
    DollarSign,
    FileText
} from 'lucide-react';

export default function Dashboard() {
    const [overview, setOverview] = useState(null);
    const [riskDist, setRiskDist] = useState(null);
    const [topVendors, setTopVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overviewRes, riskRes, vendorsRes] = await Promise.all([
                    axios.get('/api/dashboard/overview'),
                    axios.get('/api/dashboard/risk-distribution'),
                    axios.get('/api/dashboard/top-vendors')
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
                <div className="bg-white p-6 shadow rounded-lg">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Risk Distribution</h3>
                    {riskDist && <RiskPieChart data={riskDist} />}
                </div>

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
            </div>
        </div>
    );
}
