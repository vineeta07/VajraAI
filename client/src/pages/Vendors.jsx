import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Building2, AlertTriangle, ArrowRight, Search } from 'lucide-react';

export default function Vendors() {
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredVendors = vendors.filter(v =>
        v.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vendor_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading vendors...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vendor Risk Profiles</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Monitor and analyze vendor activities and risk levels.
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="max-w-lg">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        name="search"
                        id="search"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
                        placeholder="Search by vendor name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {filteredVendors.map((vendor) => (
                        <li key={vendor.vendor_id}>
                            <Link to={`/vendors/${vendor.vendor_id}`} className="block hover:bg-gray-50 transition duration-150 ease-in-out">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <Building2 className="h-6 w-6 text-indigo-600" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-lg font-medium text-indigo-600 truncate">
                                                    {vendor.vendor_name}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <span className="truncate">ID: {vendor.vendor_id}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center text-sm text-gray-900 font-semibold mb-1">
                                                ${Number(vendor.total_amount).toLocaleString()}
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {vendor.total_transactions} Transactions
                                            </span>
                                        </div>
                                        <div className="ml-5 flex-shrink-0">
                                            <ArrowRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                    {filteredVendors.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No vendors found matching your search.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
