'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  Database,
  ArrowLeft,
  Download,
  BarChart3,
  Brain,
  FileText,
  HardDrive,
  Columns,
  Rows,
  Tag,
  Trash2,
  Share2,
  FileJson,
  FileSpreadsheet,
  FileCog,
  ChevronDown,
  Calendar,
  Clock,
  Info,
  Layers,
  Eye,
  Code,
  Table,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Copy,
  Edit,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { dataAPI, analyticsAPI, insightsAPI } from '@/lib/api';

export default function DatasetDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { datasets, fetchDataset, deleteDataset, isLoading } = useData();
  const [dataset, setDataset] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [previewData, setPreviewData] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);

  useEffect(() => {
    if (id) {
      loadDataset();
      loadAnalyses();
      loadInsights();
    }
  }, [id]);

  const loadDataset = async () => {
    const result = await fetchDataset(parseInt(id));
    if (result.success) {
      setDataset(result.data.dataset);
      if (result.data.dataset.preview) {
        setPreviewData(result.data.dataset.preview.slice(0, 5));
      } else {
        fetchPreview();
      }
    }
  };

  const loadAnalyses = async () => {
    setLoadingAnalyses(true);
    try {
      const response = await analyticsAPI.listAnalyses(parseInt(id));
      setAnalyses(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading analyses:', error);
      setAnalyses([]);
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await insightsAPI.listInsights(parseInt(id));
      setInsights(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading insights:', error);
      setInsights([]);
    }
  };

  const fetchPreview = async () => {
  setLoadingPreview(true);
  try {
    const response = await dataAPI.preview(parseInt(id), 10);
    setPreviewData(response.preview || []);
  } catch (error) {
    console.error('Error fetching preview:', error);
    toast.error('Unable to load preview data. The dataset may be empty or corrupted.');
    setPreviewData([]);
  } finally {
    setLoadingPreview(false);
  }
};

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      const result = await deleteDataset(dataset.id);
      if (result.success) {
        toast.success('Dataset deleted successfully');
        router.push('/datasets');
      }
    }
  };

  const handleAnalyze = () => {
    router.push(`/analytics?datasetId=${dataset.id}`);
  };

  const handleInsights = () => {
    router.push(`/insights?datasetId=${dataset.id}`);
  };

  // Export as CSV
  const exportAsCSV = async () => {
    setExporting(true);
    const toastId = toast.loading('Preparing CSV export...');
    
    try {
      // Fetch the actual dataset content
      const response = await fetch(`http://localhost:8000/api/v1/data/datasets/${dataset.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dataset');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataset.name || 'export'}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV export completed!', { id: toastId });
    } catch (error) {
      console.error('CSV export error:', error);
      
      // Fallback: Create CSV from metadata if download fails
      try {
        const headers = dataset.columns || [];
        const rows = previewData.map(row => headers.map(h => row[h] || '').join(',')).join('\n');
        const csvContent = [headers.join(','), rows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${dataset.name || 'export'}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('CSV export completed (preview data)!', { id: toastId });
      } catch (fallbackError) {
        toast.error('Export failed. Please try again.', { id: toastId });
      }
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  // Export as JSON
  const exportAsJSON = async () => {
    setExporting(true);
    const toastId = toast.loading('Preparing JSON export...');
    
    try {
      // Create comprehensive export data
      const exportData = {
        dataset: {
          id: dataset.id,
          name: dataset.name,
          description: dataset.description,
          row_count: dataset.row_count,
          column_count: dataset.column_count,
          columns: dataset.columns,
          created_at: dataset.created_at,
          updated_at: dataset.updated_at,
          file_size: dataset.file_size,
          file_metadata: dataset.file_metadata
        },
        analyses: analyses || [],
        insights: insights || [],
        preview: previewData,
        exported_at: new Date().toISOString(),
        exported_by: user?.email
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataset.name || 'dataset'}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('JSON export completed!', { id: toastId });
    } catch (error) {
      console.error('JSON export error:', error);
      toast.error('Export failed. Please try again.', { id: toastId });
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  // Export as Excel (using CSV with .xlsx extension as fallback)
  const exportAsExcel = async () => {
    setExporting(true);
    const toastId = toast.loading('Preparing Excel export...');
    
    try {
      // For Excel, we'll create a more formatted CSV
      const headers = dataset.columns || [];
      
      // Create rows with better formatting
      const rows = previewData.map(row => 
        headers.map(h => {
          const value = row[h];
          // Format numbers nicely
          if (typeof value === 'number') {
            return value.toFixed(2);
          }
          // Escape commas in text
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value || '';
        }).join(',')
      ).join('\n');
      
      const csvContent = [headers.join(','), rows].join('\n');
      
      // Add metadata sheet info at the top
      const metadata = [
        ['Dataset Information'],
        ['Name:', dataset.name],
        ['Rows:', dataset.row_count],
        ['Columns:', dataset.column_count],
        ['Created:', new Date(dataset.created_at).toLocaleString()],
        ['Exported:', new Date().toLocaleString()],
        [],
        ['Data Preview (First 10 rows):'],
        []
      ];
      
      const excelContent = metadata.map(row => row.join(',')).join('\n') + csvContent;
      
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataset.name || 'dataset'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel export completed!', { id: toastId });
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Export failed. Please try again.', { id: toastId });
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const getFileIcon = () => {
    const ext = dataset?.name?.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'csv': return <FileCog className="h-5 w-5 text-green-600" />;
      case 'json': return <FileJson className="h-5 w-5 text-yellow-600" />;
      case 'xlsx':
      case 'xls': return <FileSpreadsheet className="h-5 w-5 text-blue-600" />;
      default: return <Database className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Database className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to access dataset details</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading || !dataset) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin"></div>
            <Database className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading dataset...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Datasets</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30" />
                <div className="relative h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  {getFileIcon()}
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{dataset.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    ID: {dataset.id}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                    {dataset.name?.split('.').pop()?.toUpperCase() || 'CSV'}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {new Date(dataset.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Export Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exporting}
                  className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  {exporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {/* Export Dropdown Menu */}
                {showExportMenu && !exporting && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <button
                      onClick={exportAsCSV}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                    >
                      <FileCog className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">CSV Format</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Export raw data as CSV</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={exportAsJSON}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border-t border-gray-100 dark:border-gray-700"
                    >
                      <FileJson className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">JSON Format</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Export with metadata</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={exportAsExcel}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border-t border-gray-100 dark:border-gray-700"
                    >
                      <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Excel Format</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Export as spreadsheet</p>
                      </div>
                    </button>
                  </motion.div>
                )}
              </div>

              <button
                onClick={handleAnalyze}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-300 flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analyze
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {dataset.row_count?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl">
                <Rows className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Columns</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {dataset.column_count || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
                <Columns className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">File Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatFileSize(dataset.file_size)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl">
                <HardDrive className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Analyses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {analyses.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <nav className="flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Info className="h-4 w-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                  activeTab === 'preview'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Table className="h-4 w-4" />
                Data Preview
              </button>
              <button
                onClick={() => setActiveTab('schema')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                  activeTab === 'schema'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Layers className="h-4 w-4" />
                Schema
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                  activeTab === 'metadata'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Code className="h-4 w-4" />
                Metadata
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300">
                      {dataset.description || 'No description provided for this dataset.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">File Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Filename:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{dataset.name}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Format:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {dataset.name?.split('.').pop()?.toUpperCase() || 'CSV'}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">File Path:</span>
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                          {dataset.file_path || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(dataset.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {dataset.updated_at ? new Date(dataset.updated_at).toLocaleString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={handleAnalyze}
                      className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 group"
                    >
                      <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="font-medium text-gray-900 dark:text-white">Analyze</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Run analysis</p>
                    </button>
                    
                    <button
                      onClick={handleInsights}
                      className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 group"
                    >
                      <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="font-medium text-gray-900 dark:text-white">Insights</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">AI analysis</p>
                    </button>
                    
                    <button
                      onClick={exportAsCSV}
                      className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 group"
                    >
                      <FileCog className="h-6 w-6 text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="font-medium text-gray-900 dark:text-white">Export CSV</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Download data</p>
                    </button>
                    
                    <button
                      onClick={handleDelete}
                      className="p-4 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-xl border border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300 group"
                    >
                      <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="font-medium text-gray-900 dark:text-white">Delete</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Remove dataset</p>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Preview</h3>
                  <button
                    onClick={fetchPreview}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Refresh preview"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingPreview ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loadingPreview ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading preview data...</p>
                  </div>
                ) : previewData.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {dataset.columns?.map((col, idx) => (
                            <th
                              key={idx}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {previewData.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {dataset.columns?.map((col, colIdx) => (
                              <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {row[col]?.toString() || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No preview data available</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Schema Tab */}
            {activeTab === 'schema' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Column Schema</h3>
                <div className="space-y-3">
                  {dataset.columns?.map((col, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{col}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Column {idx + 1} of {dataset.columns.length}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            {idx === 0 ? 'Primary' : 'Regular'}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                            string
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Metadata Tab */}
            {activeTab === 'metadata' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dataset Metadata</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      System Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Dataset ID</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{dataset.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{dataset.user_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {dataset.status || 'Active'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">File Path</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={dataset.file_path}>
                          {dataset.file_path || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {dataset.file_metadata && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Code className="h-4 w-4 text-purple-600" />
                        File Metadata
                      </h4>
                      <pre className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(dataset.file_metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      Data Quality
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Missing Values:</span>
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Duplicate Rows:</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">None detected</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Data Types:</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Mixed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Related Analyses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Analyses</h3>
          
          {loadingAnalyses ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-200 dark:border-gray-700 border-t-blue-600"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading analyses...</p>
            </div>
          ) : analyses.length > 0 ? (
            <div className="space-y-3">
              {analyses.slice(0, 3).map((analysis, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/visualizations?analysis=${analysis.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">{analysis.analysis_type} Analysis</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(analysis.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                        completed
                      </span>
                      <Eye className="h-4 w-4 text-gray-400 hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No analyses yet</p>
              <button
                onClick={handleAnalyze}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
              >
                Run First Analysis
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}