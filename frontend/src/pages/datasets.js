'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Database,
  Upload,
  Download,
  Eye,
  BarChart3,
  Brain,
  Filter,
  Search,
  MoreVertical,
  Clock,
  FileText,
  PieChart,
  Trash2,
  Share2,
  Copy,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useData } from '@/context/DataContext';

export default function DatasetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { datasets, deleteDataset, refreshDatasets } = useData();

  const filters = [
    { id: 'all', label: 'All Datasets' },
    { id: 'csv', label: 'CSV Files' },
    { id: 'excel', label: 'Excel Files' },
    { id: 'json', label: 'JSON Files' },
    { id: 'recent', label: 'Recently Added' },
    { id: 'large', label: 'Large Files' },
  ];

  const filteredDatasets = datasets.filter(dataset => {
    if (searchTerm && !dataset.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    switch (filter) {
      case 'csv':
        return dataset.name.endsWith('.csv');
      case 'excel':
        return dataset.name.endsWith('.xlsx') || dataset.name.endsWith('.xls');
      case 'json':
        return dataset.name.endsWith('.json');
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(dataset.created_at) > weekAgo;
      case 'large':
        return (dataset.file_size || 0) > 10 * 1024 * 1024; // > 10MB
      default:
        return true;
    }
  });

  const handleViewDataset = (dataset) => {
  router.push(`/datasets/${dataset.id}`);
};
  const handleAnalyzeDataset = (dataset) => {
    router.push(`/analytics?dataset=${dataset.id}`);
  };

  const handleGenerateInsights = (dataset) => {
    router.push(`/insights?dataset=${dataset.id}`);
  };

  const handleDeleteDataset = async (dataset) => {
    if (window.confirm(`Are you sure you want to delete "${dataset.name}"?`)) {
      try {
        await deleteDataset(dataset.id);
        toast.success('Dataset deleted successfully');
      } catch (error) {
        toast.error('Failed to delete dataset');
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedDatasets.length === filteredDatasets.length) {
      setSelectedDatasets([]);
    } else {
      setSelectedDatasets(filteredDatasets.map(d => d.id));
    }
  };

  const handleSelectDataset = (datasetId) => {
    setSelectedDatasets(prev => 
      prev.includes(datasetId)
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  const handleExportSelected = () => {
    if (selectedDatasets.length === 0) {
      toast.error('No datasets selected');
      return;
    }
    toast.success(`Exporting ${selectedDatasets.length} dataset(s)...`);
  };

  const handleBulkDelete = () => {
    if (selectedDatasets.length === 0) {
      toast.error('No datasets selected');
      return;
    }
    if (window.confirm(`Delete ${selectedDatasets.length} selected dataset(s)?`)) {
      selectedDatasets.forEach(id => {
        const dataset = datasets.find(d => d.id === id);
        if (dataset) {
          deleteDataset(id);
        }
      });
      toast.success(`${selectedDatasets.length} dataset(s) deleted`);
      setSelectedDatasets([]);
    }
  };

  // Format bytes to human readable with 5 decimal places
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 MB';
    
    const mb = bytes / (1024 * 1024);
    const gb = bytes / (1024 * 1024 * 1024);
    
    if (gb >= 1) {
      return `${gb.toFixed(5)} GB`;
    } else {
      return `${mb.toFixed(5)} MB`;
    }
  };

  // Calculate total size with 5 decimal places
  const totalSizeGB = datasets.reduce((sum, d) => sum + (d.file_size || 0), 0) / (1024 * 1024 * 1024);
  const formattedTotalSize = totalSizeGB.toFixed(5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Datasets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and organize your uploaded datasets
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/upload')}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Dataset
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Datasets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{datasets.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formattedTotalSize} GB
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Columns</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {datasets.reduce((sum, d) => sum + (d.column_count || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg">
              <PieChart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rows</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {datasets.length > 0 
                  ? Math.round(datasets.reduce((sum, d) => sum + (d.row_count || 0), 0) / datasets.length).toLocaleString()
                  : 0
                }
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search datasets by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-3">
            {selectedDatasets.length > 0 && (
              <>
                <button
                  onClick={handleExportSelected}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-600 dark:text-red-400 font-medium rounded-xl hover:from-red-500/20 hover:to-pink-500/20 transition-all duration-300 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-6">
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              onClick={() => setFilter(filterItem.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filter === filterItem.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filterItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Datasets Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDatasets.length === filteredDatasets.length && filteredDatasets.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Dataset
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Rows × Columns
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDatasets.length > 0 ? (
                filteredDatasets.map((dataset) => (
                  <tr 
                    key={dataset.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDatasets.includes(dataset.id)}
                        onChange={() => handleSelectDataset(dataset.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
                          <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {dataset.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {dataset.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatFileSize(dataset.file_size)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {dataset.row_count || 0} × {dataset.column_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(dataset.updated_at || dataset.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDataset(dataset)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAnalyzeDataset(dataset)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Analyze"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleGenerateInsights(dataset)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                          title="Generate Insights"
                        >
                          <Brain className="h-4 w-4" />
                        </button>
                        <div className="relative group">
                          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                            <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <Copy className="h-4 w-4" />
                              Duplicate
                            </button>
                            <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <Share2 className="h-4 w-4" />
                              Share
                            </button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
                            <button
                              onClick={() => handleDeleteDataset(dataset)}
                              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No datasets found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {searchTerm || filter !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'Upload your first dataset to get started'
                      }
                    </p>
                    <button
                      onClick={() => router.push('/upload')}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                    >
                      Upload Dataset
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}