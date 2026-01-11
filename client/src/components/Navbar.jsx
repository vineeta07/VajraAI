import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Upload,
    ScanSearch,
    AlertOctagon,
    Map,
    LogOut,
    ShieldCheck,
    Building2
} from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const links = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Upload', path: '/upload', icon: Upload },
        { name: 'Analyze', path: '/analyze', icon: ScanSearch },
        { name: 'Vendors', path: '/vendors', icon: Building2 },
        { name: 'Anomalies', path: '/anomalies', icon: AlertOctagon },
        { name: 'Heatmap', path: '/heatmap', icon: Map },
    ];

    if (!user) return null;

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <ShieldCheck className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">VajraAI</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {links.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={clsx(
                                        location.pathname === link.path
                                            ? 'border-indigo-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                                    )}
                                >
                                    <link.icon className="w-4 h-4 mr-2" />
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700 mr-4">
                            Hello, <strong>{user.name}</strong>
                        </span>
                        <button
                            onClick={logout}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <LogOut className="w-4 h-4 mr-1" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
