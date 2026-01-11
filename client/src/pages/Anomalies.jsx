import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertOctagon, Filter } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function Anomalies() {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [searchParams] = useSearchParams();
    const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');

    useEffect(() => {
        const loc = searchParams.get('location');
        setLocationFilter(loc || '');
    }, [searchParams]);

    useEffect(() => {
        fetchAnomalies();
    }, [filter, locationFilter]);

    const fetchAnomalies = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter) params.append('risk', filter);
            if (locationFilter) params.append('location', locationFilter);

            const res = await axios.get(`/api/anomalies?${params.toString()}`);
            setAnomalies(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const riskColor = (risk) => {
        switch (risk) {
            case 'HIGH': return 'bg-red-100 text-red-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Detected Anomalies</h1>
                    {locationFilter && (
                        <div className="mt-1 flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Location: {locationFilter}
                                <button
                                    type="button"
                                    className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                                    onClick={() => setLocationFilter('')}
                                >
                                    <span className="sr-only">Remove location filter</span>
                                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                    </svg>
                                </button>
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <div className="relative inline-block text-left">
                        <div className="flex items-center space-x-2">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="">All Risks</option>
                                <option value="HIGH">High Risk</option>
                                <option value="MEDIUM">Medium Risk</option>
                                <option value="LOW">Low Risk</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Transaction ID</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Vendor</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Risk Level</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {loading ? (
                                        <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>
                                    ) : anomalies.length === 0 ? (
                                        <tr><td colSpan="6" className="p-4 text-center">No anomalies found.</td></tr>
                                    ) : (
                                        anomalies.map((item) => (
                                            <tr key={item.transaction_id} className="hover:bg-gray-50 cursor-pointer transition-colors" role="button" onClick={() => window.location.href = `/anomalies/${item.transaction_id}`}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 sm:pl-6">
                                                    #{item.transaction_id}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {item.vendor_name}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    ${Number(item.amount).toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {new Date(item.transaction_date).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${riskColor(item.risk_level)}`}>
                                                        {item.risk_level}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                    <div className="flex items-center text-xs text-indigo-500 hover:text-indigo-700">
                                                        View Details &rarr;
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
