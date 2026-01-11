import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ScanSearch, Play, CheckCircle, Loader2 } from 'lucide-react';
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
                    <div className="mt-8 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-500 ease-out animate-fade-in-up">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center justify-center mb-6">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-green-100 sm:mx-0 sm:h-20 sm:w-20 ring-8 ring-green-50">
                                    <CheckCircle className="h-8 w-8 text-green-600 sm:h-10 sm:w-10" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Analysis Complete!
                                </h3>
                                <div className="mt-2 text-gray-500">
                                    <p className="mb-4">
                                        VajraAI has successfully processed your transaction data.
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-4 inline-block text-left w-full max-w-md mx-auto border border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-600">Transactions Analyzed:</span>
                                            <span className="text-sm font-bold text-indigo-600 font-mono text-lg">{result.analyzed || result.total_processed}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                            <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
                                        </div>
                                        <p className="text-xs text-gray-400 text-right">100% processed</p>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-center space-x-4">
                                    <button
                                        onClick={() => navigate('/')}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        Go to Dashboard
                                    </button>
                                    <button
                                        onClick={() => navigate('/anomalies')}
                                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        View Anomalies
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 px-4 py-3 sm:px-6 flex justify-center">
                            <p className="text-sm text-green-700 flex items-center font-medium">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                System ready for new tasks
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
