import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Upload as UploadIcon, FileType, ScanSearch, Play, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';

export default function Upload() {
    const [loading, setLoading] = useState(false);
    const [jsonContent, setJsonContent] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isUploaded, setIsUploaded] = useState(false);
    const [analyzeLoading, setAnalyzeLoading] = useState(false);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setIsUploaded(false);
            setResult(null);

            if (file.name.endsWith('.csv')) {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        if (results.data && results.data.length > 0) {
                            // Map incoming CSV headers to backend expected format
                            const mappedData = results.data.map((row, i) => ({
                                vendor_id: row.vendor_id || row.vendorId || row.VendorID || `V-DEFAULT-${i}`,
                                vendor_name: row.vendor_name || row.vendorName || row.VendorName || row.vendor || 'Unknown Vendor',
                                department: row.department || row.Department || row.dept || 'General',
                                amount: parseFloat(row.amount || row.Amount || row.value || 0),
                                location: row.location || row.Location || row.city || 'Unknown Location',
                                transaction_date: row.transaction_date || row.date || row.Date || new Date().toISOString().split('T')[0],
                                estimated_cost: parseFloat(row.estimated_cost || row.estimatedCost || row.amount || 0),
                                num_bidders: parseInt(row.num_bidders || row.bidders || 1)
                            }));
                            setJsonContent(mappedData);
                        } else {
                            toast.error("CSV file appears to be empty or invalid");
                            setJsonContent(null);
                        }
                    },
                    error: (error) => {
                        console.error(error);
                        toast.error("Error parsing CSV file");
                        setJsonContent(null);
                    }
                });
            } else {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const parsed = JSON.parse(event.target.result);
                        if (Array.isArray(parsed)) {
                            setJsonContent(parsed);
                        } else {
                            toast.error("File content must be a JSON array of transactions");
                            setJsonContent(null);
                        }
                    } catch (error) {
                        toast.error("Invalid JSON file");
                        setJsonContent(null);
                    }
                };
                reader.readAsText(file);
            }
        }
    };

    const handleUpload = async () => {
        if (!jsonContent) return;

        setLoading(true);
        try {
            await axios.post('/api/upload', jsonContent);
            toast.success('Transactions uploaded successfully!');
            setIsUploaded(true);
            setJsonContent(null); // Clear content after successful upload to save memory
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        setAnalyzeLoading(true);
        try {
            const res = await axios.post('/api/analyze');
            setResult(res.data);
            toast.success('Analysis completed successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Analysis failed');
        } finally {
            setAnalyzeLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Paper elevation={1} className="shadow sm:rounded-lg mb-8" sx={{ bgcolor: 'background.paper' }}>
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Upload Transaction Data
                    </h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                        <p>Upload a JSON or CSV file containing transaction records to be analyzed.</p>
                    </div>

                    <div className="mt-5 sm:flex sm:items-center">
                        <div className="w-full">
                            <label htmlFor="file-upload" className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-700 border-dashed rounded-md cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                                <div className="space-y-1 text-center">
                                    <FileType className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600 dark:text-gray-300 justify-center">
                                        <span className="relative cursor-pointer bg-white dark:bg-slate-900 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".json,.csv" onChange={handleFileChange} />
                                        </span>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        JSON or CSV up to 10MB
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {fileName && (
                        <div className="mt-4 flex items-center p-2 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                            <FileType className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-gray-200">{fileName}</span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 capitalize">{fileName.split('.').pop()} detected</span>
                        </div>
                    )}

                    <div className="mt-5">
                        <button
                            onClick={handleUpload}
                            disabled={!jsonContent || loading}
                            className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${(!jsonContent || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <UploadIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            {loading ? 'Uploading...' : 'Upload Transactions'}
                        </button>
                    </div>
                </div>
            </Paper>

            {/* Analysis Section */}
            {!result && (
                <Paper elevation={1} className="shadow sm:rounded-lg text-center p-8 animate-fade-in-up border border-indigo-100 dark:border-indigo-900" sx={{ bgcolor: 'background.paper' }}>
                    <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                        <ScanSearch className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready for Analysis</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Your data has been uploaded. Run our ML algorithms to detect anomalies.</p>
                    
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzeLoading}
                        className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${analyzeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {analyzeLoading ? 'Analyzing...' : <><Play className="mr-2 h-5 w-5" /> Run Analysis</>}
                    </button>
                </Paper>
            )}

            {result && (
                <Paper elevation={1} className="shadow sm:rounded-lg text-center p-8 animate-fade-in-up border border-green-100 dark:border-green-900" sx={{ bgcolor: 'background.paper' }}>
                    <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 ring-4 ring-green-50 dark:ring-green-900/10">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analysis Complete!</h3>
                    
                    <div className="mt-4 bg-gray-50 dark:bg-slate-800 rounded-lg p-4 inline-block text-left w-full max-w-sm border border-gray-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions Analyzed:</span>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono text-lg">
                                {result.analyzed || result.total_processed || 'Complete'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mb-1">
                            <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
                        </div>
                        <p className="text-xs text-gray-400 text-right">100% processed</p>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                        <button
                            onClick={() => navigate('/vendors')}
                            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            View Vendors
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center px-6 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            View Dashboard
                        </button>
                    </div>
                </Paper>
            )}

        </div>
    );
}
