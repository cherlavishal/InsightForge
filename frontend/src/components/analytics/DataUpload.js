'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Database,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const DataUpload = ({ onUpload, onFileSelect, maxSize = 10485760 }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewData, setPreviewData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.name} exceeds size limit`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name} has invalid file type`);
          } else {
            toast.error(`${file.name}: ${error.message}`);
          }
        });
      });
    }

    // Process accepted files
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      errors: [],
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Notify parent
    if (onFileSelect) {
      onFileSelect(newFiles);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json']
    },
    maxSize: maxSize,
    multiple: true
  });

  const validateFile = (file) => {
    const errors = [];
    
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }
    
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx|json)$/i)) {
      errors.push('Invalid file type. Please upload CSV, Excel, or JSON files');
    }
    
    return errors;
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Validate all files
      const allErrors = [];
      const validFiles = files.filter(file => {
        const errors = validateFile(file.file);
        if (errors.length > 0) {
          allErrors.push({ fileName: file.name, errors });
          return false;
        }
        return true;
      });

      if (allErrors.length > 0) {
        setValidationErrors(allErrors);
        toast.error('Some files have validation errors');
        setUploading(false);
        return;
      }

      // Upload files
      if (onUpload) {
        await onUpload(validFiles.map(f => f.file), (progress) => {
          setUploadProgress(progress);
        });
      }

      // Update file statuses
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'uploaded'
      })));

      toast.success(`Successfully uploaded ${validFiles.length} file(s)`);
      
    } catch (error) {
      toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    if (files.length === 1) {
      setPreviewData(null);
    }
    setValidationErrors([]);
  };

  const clearAll = () => {
    setFiles([]);
    setPreviewData(null);
    setValidationErrors([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30">
            <Upload className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              or click to browse
            </p>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Supports CSV, Excel, JSON files up to {maxSize / 1024 / 1024}MB
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Selected Files ({files.length})
            </h3>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                    <File className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.status === 'uploaded' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {file.errors?.length > 0 && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    disabled={uploading}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Upload {files.length} File(s)</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-red-800 dark:text-red-300">
              Validation Errors
            </h3>
          </div>
          
          <div className="space-y-3">
            {validationErrors.map((error, index) => (
              <div key={index} className="text-sm">
                <p className="font-medium text-red-700 dark:text-red-400">
                  {error.fileName}
                </p>
                <ul className="mt-1 ml-4 list-disc text-red-600 dark:text-red-500">
                  {error.errors.map((err, errIndex) => (
                    <li key={errIndex}>{err}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setValidationErrors([])}
            className="mt-4 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Upload Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
      >
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
          Upload Tips
        </h3>
        
        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
          <li className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Ensure your CSV has headers in the first row</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Remove sensitive information before uploading</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Large files may take longer to process</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Supported formats: CSV, XLS, XLSX, JSON</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default DataUpload;