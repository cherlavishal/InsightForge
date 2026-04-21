'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  LineChart,
  TrendingUp,
  Database,
  Filter,
  Play,
  Target,
  ArrowRight,
  ChevronRight,
  Plus,
  Clock,
  Download,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { analyticsAPI, insightsAPI } from '@/lib/api';

export default function AnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const datasetIdFromUrl = searchParams.get('datasetId');
  
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('quick');
  const [selectedTimeCol, setSelectedTimeCol] = useState('');
  const [selectedValueCol, setSelectedValueCol] = useState('');
  const [selectedTargetCol, setSelectedTargetCol] = useState('');
  const { datasets, analyses, fetchDatasets } = useData();
  const { user } = useAuth();

  // Load datasets on mount
  useEffect(() => {
    if (user) {
      fetchDatasets();
    }
  }, [user, fetchDatasets]);

  // Set selected dataset from URL parameter
  useEffect(() => {
    if (datasets.length > 0 && datasetIdFromUrl) {
      const dataset = datasets.find(d => d.id === parseInt(datasetIdFromUrl));
      if (dataset) {
        setSelectedDataset(dataset);
        // Auto-select columns when dataset changes
        if (dataset.columns) {
          // Find time column
          const timeCol = dataset.columns.find(c => 
            c.toLowerCase().includes('date') || 
            c.toLowerCase().includes('year') || 
            c.toLowerCase().includes('time')
          ) || dataset.columns[0];
          
          // Find value column (numeric looking)
          const valueCol = dataset.columns.find(c => 
            !c.toLowerCase().includes('date') && 
            !c.toLowerCase().includes('year') && 
            !c.toLowerCase().includes('id') && 
            !c.toLowerCase().includes('name') &&
            (c.toLowerCase().includes('value') || 
             c.toLowerCase().includes('price') || 
             c.toLowerCase().includes('count') || 
             c.toLowerCase().includes('amount'))
          ) || dataset.columns[1] || dataset.columns[0];
          
          // Find target column for predictions
          const targetCol = dataset.columns.find(c => 
            c.toLowerCase().includes('value') || 
            c.toLowerCase().includes('price') || 
            c.toLowerCase().includes('count') || 
            c.toLowerCase().includes('amount') ||
            c.toLowerCase().includes('score')
          ) || dataset.columns[0];
          
          setSelectedTimeCol(timeCol);
          setSelectedValueCol(valueCol);
          setSelectedTargetCol(targetCol);
        }
      }
    } else if (datasets.length > 0 && !selectedDataset) {
      setSelectedDataset(datasets[0]);
    }
  }, [datasets, datasetIdFromUrl]);

  // Quick analyses mapping
  const quickAnalyses = [
    {
      id: 'summary',
      title: 'Summary Statistics',
      description: 'Get quick overview of your data',
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      apiType: 'descriptive',
      needsParams: false
    },
    {
      id: 'quality',
      title: 'Data Quality Check',
      description: 'Identify missing values and outliers',
      icon: <Filter className="h-4 w-4" />,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      apiType: 'descriptive',
      needsParams: false
    },
    {
      id: 'patterns',
      title: 'Pattern Detection',
      description: 'Find hidden patterns in your data',
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      apiType: 'trend',
      needsParams: true
    },
    {
      id: 'quick-predict',
      title: 'Quick Predictions',
      description: 'Make instant predictions',
      icon: <Target className="h-4 w-4" />,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      apiType: 'prediction',
      needsParams: true
    }
  ];

  // Advanced analysis types
  const analysisTypes = [
    {
      id: 'descriptive',
      title: 'Descriptive Statistics',
      description: 'Basic statistics & summaries',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      features: ['Mean & Median', 'Standard Deviation', 'Quartiles', 'Distribution'],
      needsParams: false
    },
    {
      id: 'correlation',
      title: 'Correlation Analysis',
      description: 'Find relationships between variables',
      icon: <LineChart className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
      features: ['Pearson Correlation', 'Spearman Rank', 'Heatmap', 'Scatter Plots'],
      needsParams: true
    },
    {
      id: 'trend',
      title: 'Trend Analysis',
      description: 'Identify patterns over time',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500',
      features: ['Time Series', 'Seasonality', 'Moving Averages', 'Trend Lines'],
      needsParams: true
    },
    {
      id: 'prediction',
      title: 'Predictive Modeling',
      description: 'Forecast future values',
      icon: <Target className="h-5 w-5" />,
      color: 'from-orange-500 to-red-500',
      features: ['Regression', 'Classification', 'Forecasting', 'ML Models'],
      needsParams: true
    }
  ];

  const runAnalysis = async (analysisId, apiType) => {
    if (!selectedDataset) {
      toast.error('Please select a dataset first');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(`Running ${analysisId} analysis...`);

    try {
      let response;
      const startTime = Date.now();
      
      // Map to actual API calls based on type
      switch(apiType) {
        case 'descriptive':
          response = await analyticsAPI.descriptive(selectedDataset.id);
          break;
          
        case 'correlation':
          // For correlation, we need columns
          const columns = selectedDataset.columns || [];
          if (columns.length < 2) {
            throw new Error('Need at least 2 columns for correlation analysis');
          }
          response = await analyticsAPI.correlation(selectedDataset.id, columns.slice(0, 5)); // Limit to first 5 columns for performance
          break;
          
        case 'trend':
          // For trend, we need time and value columns
          if (!selectedTimeCol || !selectedValueCol) {
            throw new Error('Please select time and value columns for trend analysis');
          }
          response = await analyticsAPI.trend(selectedDataset.id, selectedTimeCol, selectedValueCol, 'daily');
          break;
          
        case 'prediction':
          // For prediction, we need a target column
          if (!selectedTargetCol) {
            throw new Error('Please select a target column for prediction');
          }
          response = await insightsAPI.predict(
            selectedDataset.id,
            selectedTargetCol,
            null,
            'regression',
            5
          );
          break;
          
        default:
          throw new Error(`Unknown analysis type: ${apiType}`);
      }

      const executionTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      toast.success(`${analysisId} analysis completed in ${executionTime}s!`, { id: toastId });
      
      // Refresh analyses list
      await fetchDatasets();

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(
        error.response?.data?.detail || error.message || 'Analysis failed',
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    if (!selectedDataset) {
      toast.error('Please select a dataset first');
      return;
    }
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleDatasetSelect = (dataset) => {
    setSelectedDataset(dataset);
    toast.success(`Selected dataset: ${dataset.name}`);
  };

  const handleViewResults = (analysis) => {
    router.push(`/visualizations?analysis=${analysis.id}`);
  };

  const handleExportResults = (analysis) => {
    try {
      const dataStr = JSON.stringify(analysis.results, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const fileName = `${analysis.analysis_type}_${analysis.dataset_name || analysis.dataset_id}_${new Date(analysis.created_at).toISOString().split('T')[0]}.json`;
      
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', fileName);
      link.click();
      
      toast.success('Analysis exported');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Not Authenticated</h2>
          <p className="mb-4">Please log in to access analytics</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Run AI-powered analyses on your datasets to uncover insights and patterns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleNewAnalysis}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Analysis
          </button>
        </div>
      </div>

      {/* Dataset Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Dataset</h2>
          </div>
          <button
            onClick={() => router.push('/datasets')}
            className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
          >
            View all datasets
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {datasets.slice(0, 4).map((dataset) => (
            <button
              key={dataset.id}
              onClick={() => handleDatasetSelect(dataset)}
              className={`p-4 rounded-xl border transition-all duration-300 text-left group ${
                selectedDataset?.id === dataset.id
                  ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
                  <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                {selectedDataset?.id === dataset.id && (
                  <div className="h-2 w-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{dataset.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {dataset.row_count?.toLocaleString() || 0} rows × {dataset.column_count || 0} columns
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                Updated {new Date(dataset.updated_at || dataset.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
          
          {datasets.length === 0 && (
            <div className="col-span-4 text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No datasets found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload your first dataset to start analyzing
              </p>
              <button
                onClick={() => router.push('/upload')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
              >
                Upload Dataset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Column Selectors for Parameter-based Analyses */}
      {selectedDataset && selectedDataset.columns && selectedDataset.columns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analysis Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Column Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Column (for Trend)
              </label>
              <select
                value={selectedTimeCol}
                onChange={(e) => setSelectedTimeCol(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {selectedDataset.columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            {/* Value Column Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Value Column (for Trend)
              </label>
              <select
                value={selectedValueCol}
                onChange={(e) => setSelectedValueCol(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {selectedDataset.columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            {/* Target Column Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Column (for Prediction)
              </label>
              <select
                value={selectedTargetCol}
                onChange={(e) => setSelectedTargetCol(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {selectedDataset.columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          {['quick', 'advanced', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'quick' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickAnalyses.map((analysis) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${analysis.color}`}>
                  {analysis.icon}
                </div>
                <button
                  onClick={() => runAnalysis(analysis.id, analysis.apiType)}
                  disabled={loading || !selectedDataset}
                  className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Running...' : 'Run'}
                  {!loading && <Play className="h-3 w-3" />}
                </button>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{analysis.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{analysis.description}</p>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysisTypes.map((analysis) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 bg-gradient-to-r ${analysis.color} rounded-lg`}>
                  <div className="text-white">{analysis.icon}</div>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{analysis.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{analysis.description}</p>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => runAnalysis(analysis.id, analysis.id)}
                  disabled={loading || !selectedDataset}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Running...' : 'Run Analysis'}
                  {!loading && <ArrowRight className="h-3 w-3" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Analyses</h2>
          {analyses.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No analyses yet. Run your first analysis to see results here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.slice(0, 10).map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                      {analysis.analysis_type || 'Analysis'}
                    </h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      completed
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                      <Database className="h-3 w-3" />
                      {analysis.dataset_name || `Dataset ${analysis.dataset_id}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewResults(analysis)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="View Results"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleExportResults(analysis)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Export Results"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <span>{new Date(analysis.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}