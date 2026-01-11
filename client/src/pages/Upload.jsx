import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Upload as UploadIcon, FileJson, FileType } from 'lucide-react';
import Papa from 'papaparse';

export default function Upload() {
    const [loading, setLoading] = useState(false);
    const [jsonContent, setJsonContent] = useState(null);
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);

            if (file.name.endsWith('.csv')) {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        if (results.data && results.data.length > 0) {
                            // Basic validation: check if first row has required fields or looks like transaction
                            // For now assuming correct mapping if headers match
                            setJsonContent(results.data);
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
                // Assume JSON
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
            setJsonContent(null);
            setFileName('');
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Upload Transaction Data
                    </h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>Upload a JSON or CSV file containing transaction records to be analyzed.</p>
                    </div>

                    <div className="mt-5 sm:flex sm:items-center">
                        <div className="w-full">
                            <label htmlFor="file-upload" className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500">
                                <div className="space-y-1 text-center">
                                    <FileType className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
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
                        <div className="mt-4 flex items-center p-2 bg-gray-50 rounded">
                            <FileType className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{fileName}</span>
                            <span className="ml-2 text-xs text-gray-500 capitalize">{fileName.split('.').pop()} detected</span>
                        </div>
                    )}

                    <div className="mt-5">
                        <button
                            onClick={handleUpload}
                            disabled={!jsonContent || loading}
                            className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${(!jsonContent || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <UploadIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            {loading ? 'Uploading...' : 'Upload Transactions'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Sample JSON</h4>
                    <pre className="bg-gray-800 text-gray-100 p-4 rounded text-xs overflow-auto h-40">
                        {`[
  {
    "vendor_id": "V001",
    "vendor_name": "Acme Corp",
    "department": "IT",
    "amount": 1500.00,
    "location": "New York",
    "transaction_date": "2023-10-25"
  }
]`}
                    </pre>
                </div>
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Sample CSV</h4>
                    <pre className="bg-gray-800 text-gray-100 p-4 rounded text-xs overflow-auto h-40">
                        {`vendor_id,vendor_name,department,amount,location,transaction_date
V001,Acme Corp,IT,1500.00,New York,2023-10-25
V002,Global Supplies,HR,4200.50,London,2023-10-26`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
