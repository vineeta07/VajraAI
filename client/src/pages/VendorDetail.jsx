import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Building2, AlertTriangle, ArrowLeft, DollarSign, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function VendorDetail() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const res = await axios.get(`/api/vendors/${id}`);
                setData(res.data);
            } catch (error) {
                console.error("Error fetching vendor details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendor();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!data) return <div className="p-8 text-center">Vendor not found</div>;

    const { vendor, transactions } = data;

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <Link to="/vendors" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Vendors
                </Link>
            </div>

            <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{vendor.vendor_name}</h1>
                    <p className="text-gray-500">Vendor ID: {vendor.vendor_id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Spent"
                    value={`$${Number(vendor.total_amount).toLocaleString()}`}
                    icon={DollarSign}
                    color="green"
                />
                <StatCard
                    title="Total Transactions"
                    value={vendor.total_transactions}
                    icon={Building2}
                    color="indigo"
                />
                <StatCard
                    title="High Risk Anomalies"
                    value={vendor.high_risk_count}
                    icon={Activity}
                    color={Number(vendor.high_risk_count) > 0 ? "red" : "gray"}
                />
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Transaction History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Risk Level
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">View</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className={tx.risk_level === 'HIGH' ? 'bg-red-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(tx.transaction_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ${Number(tx.amount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tx.department}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {tx.risk_level ? (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${tx.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                    tx.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'}`}>
                                                {tx.risk_level}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {tx.risk_level && (
                                            <Link to={`/anomalies/${tx.id}`} className="text-indigo-600 hover:text-indigo-900">
                                                View Details
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
