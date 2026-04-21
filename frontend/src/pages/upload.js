import { useState } from 'react';
import { useRouter } from 'next/router';
import { useData } from '@/context/DataContext';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { uploadDataset } = useData();
  const router = useRouter();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const validExtensions = ['.csv', '.json', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
      if (!validExtensions.includes(fileExtension)) {
        toast.error('Please upload CSV, JSON, or Excel files only');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Upload file using the context method
      const result = await uploadDataset(file);
      
      if (result.success) {
        toast.success('File uploaded successfully!');
        setTimeout(() => {
          router.push('/datasets');
        }, 1000);
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Data</h1>
          <p className="mt-2 text-gray-600">
            Upload your CSV, Excel, or JSON files for AI-powered analysis
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Upload Area */}
          <div 
            className={`p-12 border-2 border-dashed rounded-lg m-6 text-center transition-all ${
              file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {file ? file.name : 'Drag & drop your file here'}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {file 
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.name.split('.').pop().toUpperCase()} file`
                  : 'or click to browse files. Supports CSV, JSON, Excel (10MB max)'
                }
              </p>

              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".csv,.json,.xlsx,.xls"
              />
              
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {file ? 'Choose Different File' : 'Browse Files'}
                </div>
              </label>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="mt-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* File Preview */}
          {file && !uploading && (
            <div className="p-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">File Preview</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {file.name.split('.').pop().charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.name.split('.').pop().toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {uploading ? 'Uploading...' : 'Upload & Analyze'}
              </button>
            </div>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <span className="text-green-600 font-bold">CSV</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">CSV Files</h4>
            <p className="text-sm text-gray-600">
              Comma-separated values with headers. Perfect for tabular data.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 font-bold">XLSX</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Excel Files</h4>
            <p className="text-sm text-gray-600">
              Microsoft Excel files (.xlsx, .xls). Supports multiple sheets.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <span className="text-purple-600 font-bold">JSON</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">JSON Files</h4>
            <p className="text-sm text-gray-600">
              JavaScript Object Notation. Great for nested and structured data.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}