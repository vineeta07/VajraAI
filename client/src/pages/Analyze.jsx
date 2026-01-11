import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ScanSearch, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Analyze() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/api/analyze');
            setResult(res.data);
            toast.success('Analysis completed successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow sm:rounded-lg text-center p-12">
                <div className="mx-auto h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                    <ScanSearch className="h-12 w-12 text-indigo-600" />
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                    Fraud Detection Analysis
                </h2>
                <p className="text-lg text-gray-500 mb-8">
                    Run our advanced machine learning algorithms to detect anomalies in your uploaded transaction data.
                </p>

                {!result ? (
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            'Analyzing...'
                        ) : (
                            <>
                                <Play className="mr-2 h-5 w-5" />
                                Run Analysis
                            </>
                        )}
                    </button>
                ) : (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Play className="h-5 w-5 text-green-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">Analysis Complete</h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>{result.message}</p>
                                        <p>Processed {result.analyzed} transactions.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/anomalies')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                View Anomalies
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
