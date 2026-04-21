'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Database,
  Download,
  Share2,
  RefreshCw,
  Clock,
  ChevronRight,
  Eye,
  Maximize2,
  X,  // Keep this imported from lucide-react
  Trash2,
  Activity,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Calendar,
  Filter,
  Users,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import DescriptiveStatsChart from '@/components/visualizations/DescriptiveStatsChart';
import CorrelationChart from '@/components/visualizations/CorrelationChart';
import TrendChart from '@/components/visualizations/TrendChart';
import PredictionChart from '@/components/visualizations/PredictionChart';
import { actionsAPI } from '@/lib/api';

export default function VisualizationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get('analysis');
  
  const { user } = useAuth();
  const { datasets, analyses, fetchDatasets } = useData();
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [fullscreenAnalysis, setFullscreenAnalysis] = useState(null);
  const [analysisType, setAnalysisType] = useState('all');
  const [userActions, setUserActions] = useState([]);
  const [showActions, setShowActions] = useState(false);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchDatasets();
      fetchUserActions();
    }
  }, [user, fetchDatasets]);

  useEffect(() => {
    if (datasets.length > 0 && !selectedDataset) {
      setSelectedDataset(datasets[0]);
    }
  }, [datasets]);

  // Load analysis from URL if provided
  useEffect(() => {
    if (analysisId && analyses.length > 0) {
      const analysis = analyses.find(a => a.id === parseInt(analysisId));
      if (analysis) {
        setSelectedAnalysis(analysis);
        setFullscreenAnalysis(analysis);
      }
    }
  }, [analysisId, analyses]);

  const fetchUserActions = async () => {
    setActionsLoading(true);
    try {
      const data = await actionsAPI.getMyActions();
      setUserActions(data || []);
    } catch (error) {
      console.error('Failed to fetch actions:', error);
      // Load from localStorage as fallback
      const scheduled = JSON.parse(localStorage.getItem('scheduled_items') || '[]');
      const implemented = JSON.parse(localStorage.getItem('implemented_items') || '[]');
      const dismissed = JSON.parse(localStorage.getItem('dismissed_items') || '[]');
      
      const localActions = [
        ...scheduled.map(item => ({ 
          ...item, 
          action_type: 'schedule', 
          status: 'pending',
          id: item.id || `sched-${Date.now()}-${Math.random()}`
        })),
        ...implemented.map(item => ({ 
          ...item, 
          action_type: 'implement', 
          status: 'completed',
          id: item.id || `impl-${Date.now()}-${Math.random()}`
        })),
        ...dismissed.map(item => ({ 
          id: item, 
          action_type: 'dismiss', 
          status: 'completed',
          created_at: new Date().toISOString()
        }))
      ];
      setUserActions(localActions);
    } finally {
      setActionsLoading(false);
    }
  };

  const getChartIcon = (analysisType) => {
    switch (analysisType) {
      case 'descriptive':
      case 'summary':
      case 'quality':
        return <BarChart3 className="h-5 w-5" />;
      case 'correlation':
        return <Activity className="h-5 w-5" />;
      case 'trend':
      case 'patterns':
        return <TrendingUp className="h-5 w-5" />;
      case 'prediction':
      case 'quick-predict':
        return <Target className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getChartColor = (analysisType) => {
    switch (analysisType) {
      case 'descriptive':
      case 'summary':
      case 'quality':
        return 'from-blue-500 to-cyan-500';
      case 'correlation':
        return 'from-green-500 to-emerald-500';
      case 'trend':
      case 'patterns':
        return 'from-purple-500 to-pink-500';
      case 'prediction':
      case 'quick-predict':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'implement': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'schedule': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'dismiss': return <X className="h-4 w-4 text-gray-500" />;  // Using lucide-react X
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'implement': return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'schedule': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
      case 'dismiss': return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">Completed</span>;
      case 'pending':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const handleExport = (analysis) => {
    try {
      const dataStr = JSON.stringify(analysis.results, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const fileName = `${analysis.type}_${analysis.dataset_name}_${new Date(analysis.created_at).toISOString().split('T')[0]}.json`;
      
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', fileName);
      link.click();
      
      toast.success('Analysis exported');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleShare = (analysis) => {
    navigator.clipboard.writeText(`${window.location.origin}/visualizations?analysis=${analysis.id}`);
    toast.success('Link copied');
  };

  const handleViewFullscreen = (analysis) => {
    setFullscreenAnalysis(analysis);
  };

  const closeFullscreen = () => {
    setFullscreenAnalysis(null);
  };

  const handleDeleteAction = async (actionId) => {
    if (!window.confirm('Are you sure you want to delete this action?')) return;
    
    try {
      await actionsAPI.deleteAction(actionId);
      toast.success('Action deleted');
      fetchUserActions();
    } catch (error) {
      toast.error('Failed to delete action');
    }
  };

  const getAnalysisComponent = (analysis) => {
    if (!analysis || !analysis.results) return null;

    const type = analysis.type || analysis.analysis_type;

    switch (type) {
      case 'descriptive':
      case 'summary':
      case 'quality':
        return <DescriptiveStatsChart data={analysis.results} />;
      case 'correlation':
        return <CorrelationChart data={analysis.results} />;
      case 'trend':
      case 'patterns':
        return <TrendChart data={analysis.results} />;
      case 'prediction':
      case 'quick-predict':
        return <PredictionChart data={analysis.results} />;
      default:
        return (
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(analysis.results, null, 2)}
          </pre>
        );
    }
  };

  const filteredAnalyses = analyses
    .filter(a => !selectedDataset || a.dataset_id === selectedDataset.id)
    .filter(a => analysisType === 'all' || a.type === analysisType);

  const filteredActions = userActions.filter(action => {
    if (actionFilter === 'all') return true;
    return action.action_type === actionFilter;
  });

  const analysisTypes = [
    { id: 'all', label: 'All', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'descriptive', label: 'Descriptive', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'summary', label: 'Summary', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'quality', label: 'Quality', icon: <Activity className="h-4 w-4" /> },
    { id: 'correlation', label: 'Correlation', icon: <Activity className="h-4 w-4" /> },
    { id: 'trend', label: 'Trend', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'patterns', label: 'Patterns', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'prediction', label: 'Prediction', icon: <Target className="h-4 w-4" /> },
  ];

  const actionFilters = [
    { id: 'all', label: 'All Actions', icon: <Zap className="h-4 w-4" /> },
    { id: 'implement', label: 'Implemented', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'schedule', label: 'Scheduled', icon: <Calendar className="h-4 w-4" /> },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Not Authenticated</h2>
          <p className="mb-4">Please log in to access visualizations</p>
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
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis Results</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive visualizations from your data analyses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowActions(!showActions)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              showActions 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Users className="h-4 w-4" />
            {showActions ? 'Hide Actions' : 'My Actions'} ({userActions.length})
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {viewMode === 'grid' ? 'List' : 'Grid'}
          </button>
          <button
            onClick={() => router.push('/analytics')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg"
          >
            New Analysis
          </button>
        </div>
      </div>

      {/* My Actions Panel */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Action Tracker</h2>
            </div>
            <button
              onClick={fetchUserActions}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${actionsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Action Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {actionFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActionFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  actionFilter === filter.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>

          {/* Actions Grid */}
          {actionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={`action-skel-${i}`} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No actions found. Implement or schedule insights to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActions.map((action) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-xl border ${getActionColor(action.action_type)} relative group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getActionIcon(action.action_type)}
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">
                        {action.action_type}
                      </span>
                    </div>
                    {getStatusBadge(action.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    {action.insight_id && (
                      <p className="text-gray-600 dark:text-gray-400">
                        Insight ID: <span className="font-mono">{action.insight_id}</span>
                      </p>
                    )}
                    {action.scheduled_for && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(action.scheduled_for)}</span>
                      </div>
                    )}
                    {action.completed_at && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <CheckCircle className="h-3 w-3" />
                        <span>Completed: {formatDate(action.completed_at)}</span>
                      </div>
                    )}
                    {action.notes && (
                      <p className="text-gray-600 dark:text-gray-400 italic">"{action.notes}"</p>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                    Created: {formatDate(action.created_at)}
                  </div>

                  <button
                    onClick={() => handleDeleteAction(action.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Implemented</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {userActions.filter(a => a.action_type === 'implement').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {userActions.filter(a => a.action_type === 'schedule').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {userActions.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {userActions.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dataset and Type Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Dataset Filter */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
                <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filter by Dataset</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDataset(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedDataset === null
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {datasets.map((dataset) => (
                <button
                  key={dataset.id}
                  onClick={() => setSelectedDataset(dataset)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedDataset?.id === dataset.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {dataset.name.length > 20 ? dataset.name.substring(0, 17) + '...' : dataset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Type Filter */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filter by Type</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysisTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setAnalysisType(type.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    analysisType === type.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {filteredAnalyses.length} result{filteredAnalyses.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Results Grid/List */}
      {filteredAnalyses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-12 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Analysis Results
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Run your first analysis to see visualizations here
          </p>
          <button
            onClick={() => router.push('/analytics')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg"
          >
            Go to Analytics
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnalyses.map((analysis) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 overflow-hidden group cursor-pointer"
              onClick={() => handleViewFullscreen(analysis)}
            >
              {/* Preview */}
              <div className={`h-32 bg-gradient-to-r ${getChartColor(analysis.type)} p-4 flex items-center justify-center`}>
                <div className="text-white text-center">
                  <div className="flex justify-center mb-2">
                    {getChartIcon(analysis.type)}
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {analysis.type} Analysis
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                      {analysis.type} Analysis
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <Database className="h-3 w-3" />
                      {analysis.dataset_name?.length > 25 
                        ? analysis.dataset_name.substring(0, 22) + '...' 
                        : analysis.dataset_name}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {analysis.execution_time}s
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(analysis);
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Download className="h-4 w-4 text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(analysis);
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Share2 className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dataset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAnalyses.map((analysis) => (
                <tr 
                  key={analysis.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => handleViewFullscreen(analysis)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-r ${getChartColor(analysis.type)}`}>
                        <div className="text-white">{getChartIcon(analysis.type)}</div>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {analysis.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {analysis.dataset_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {analysis.execution_time}s
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(analysis.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleExport(analysis)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Download className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleShare(analysis)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Share2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fullscreen Modal with Professional Visualizations */}
      {fullscreenAnalysis && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 md:p-8">
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => handleExport(fullscreenAnalysis)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              title="Export JSON"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleShare(fullscreenAnalysis)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={closeFullscreen}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="w-full h-full flex flex-col">
            <div className="text-white mb-4">
              <h2 className="text-2xl font-bold capitalize">{fullscreenAnalysis.type} Analysis</h2>
              <p className="text-gray-300">Dataset: {fullscreenAnalysis.dataset_name}</p>
              <p className="text-gray-400 text-sm mt-1">
                Completed in {fullscreenAnalysis.execution_time}s • {new Date(fullscreenAnalysis.created_at).toLocaleString()}
              </p>
            </div>
            
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 overflow-auto">
              {getAnalysisComponent(fullscreenAnalysis)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}