import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Search } from 'lucide-react';

export default function Vendors() {
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRisk, setFilterRisk] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const res = await axios.get('/api/vendors');
                setVendors(res.data);
            } catch (error) {
                console.error("Error fetching vendors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const filteredVendors = vendors.filter(v => {
        const matchesSearch = v.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              v.vendor_id.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesFilter = true;
        if (filterRisk === 'HIGH_RISK') matchesFilter = v.high_risk_count > 0;
        if (filterRisk === 'FLAGGED') matchesFilter = v.flagged_count > 0;
        if (filterRisk === 'SAFE') matchesFilter = v.flagged_count === 0;

        return matchesSearch && matchesFilter;
    });

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading vendors...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vendor Risk Profiles</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Monitor and analyze vendor activities and risk levels.
                    </p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                <div className="relative rounded-md shadow-sm flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        name="search"
                        id="search"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md p-2.5"
                        placeholder="Search by vendor name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="sm:w-48">
                    <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md p-2.5"
                    >
                        <option value="ALL">All Vendors</option>
                        <option value="HIGH_RISK">High Risk Only</option>
                        <option value="FLAGGED">Flagged</option>
                        <option value="SAFE">Safe (No Flags)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-slate-700">
                <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredVendors.map((vendor) => (
                        <li key={vendor.vendor_id}>
                            <Link to={`/vendors/${vendor.vendor_id}`} className="block hover:bg-gray-50 dark:hover:bg-slate-800 transition duration-150 ease-in-out">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-base font-medium text-indigo-600 dark:text-indigo-400 truncate">
                                                    {vendor.vendor_name}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2 mt-1">
                                                    <span className="truncate">ID: {vendor.vendor_id}</span>
                                                    {vendor.flagged_count > 0 && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                            Flagged: {vendor.flagged_count}
                                                        </span>
                                                    )}
                                                    {vendor.high_risk_count > 0 && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                                            High Risk: {vendor.high_risk_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center text-sm text-gray-900 dark:text-white font-semibold mb-1">
                                                ${Number(vendor.total_amount).toLocaleString()}
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300">
                                                {vendor.total_transactions} Transactions
                                            </span>
                                        </div>
                                        <div className="ml-5 flex-shrink-0">
                                            <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                    {filteredVendors.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            No vendors found matching your search.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
