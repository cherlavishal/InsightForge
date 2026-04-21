'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  BarChart3, 
  Brain, 
  Database,
  TrendingUp,
  FileText,
  Clock,
  Plus,
  Download,
  RefreshCw,
  Sparkles,
  Shield,
  Activity,
  ChevronRight,
  Cloud,
  FileJson,
  FileCog
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import MetricsCard from '../components/dashboard/MetricsCard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    datasets, 
    analyses, 
    insights, 
    fetchDatasets, 
    refreshInsights,
    refreshAnalyses,
    isLoading: dataLoading 
  } = useData();
  
  const [filteredStats, setFilteredStats] = useState({
    totalDatasets: 0,
    totalAnalyses: 0,
    totalInsights: 0,
    storageUsed: '0 MB'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  // Use refs to track if initial fetch is done and to store stable values
  const initialFetchDone = useRef(false);
  const timeRangeRef = useRef(timeRange);

  // Update ref when timeRange changes
  useEffect(() => {
    timeRangeRef.current = timeRange;
  }, [timeRange]);

  const timeRanges = [
    { label: 'Today', value: '1d', days: 1 },
    { label: 'Week', value: '7d', days: 7 },
    { label: 'Month', value: '30d', days: 30 },
    { label: 'Quarter', value: '90d', days: 90 },
  ];

  // Get current time range object
  const currentTimeRange = timeRanges.find(r => r.value === timeRange) || timeRanges[1];

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please login to access dashboard');
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch data when user is authenticated (only once)
  useEffect(() => {
    if (user && !initialFetchDone.current) {
      fetchDatasets();
      initialFetchDone.current = true;
    }
  }, [user, fetchDatasets]);

  // Refresh insights and analyses periodically
  useEffect(() => {
    if (user && datasets.length > 0) {
      const interval = setInterval(() => {
        refreshInsights();
        refreshAnalyses();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user, datasets.length, refreshInsights, refreshAnalyses]);

  // Update stats and activity when datasets, analyses, insights, or timeRange change
  useEffect(() => {
    // Get current time range days from ref to avoid dependency on timeRange
    const currentDays = timeRanges.find(r => r.value === timeRangeRef.current)?.days || 7;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - currentDays);

    // Filter datasets by date
    const filteredDatasets = datasets.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate >= cutoffDate;
    });

    // Filter analyses by date
    const filteredAnalyses = analyses.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate >= cutoffDate;
    });

    // Filter insights by date
    const filteredInsights = insights.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate >= cutoffDate;
    });
    
    // Calculate filtered storage
    const filteredStorage = filteredDatasets.reduce((sum, dataset) => sum + (dataset.file_size || 0), 0) / (1024 * 1024);
    
    setFilteredStats({
      totalDatasets: filteredDatasets.length,
      totalAnalyses: filteredAnalyses.length,
      totalInsights: filteredInsights.length,
      storageUsed: `${filteredStorage.toFixed(1)} MB`
    });

    // Get recent activity
    const activity = [];
    
    // Add dataset uploads
    filteredDatasets.slice(0, 3).forEach(dataset => {
      activity.push({
        id: `ds-${dataset.id}`,
        type: 'upload',
        icon: <Database className="h-4 w-4" />,
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
        user: 'You',
        action: 'uploaded dataset',
        target: dataset.name,
        time: new Date(dataset.created_at),
        timeFormatted: new Date(dataset.created_at).toLocaleDateString(),
        status: 'completed'
      });
    });

    // Add insights
    filteredInsights.slice(0, 3).forEach(insight => {
      activity.push({
        id: `in-${insight.id}`,
        type: 'insight',
        icon: <Brain className="h-4 w-4" />,
        color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
        user: 'AI',
        action: 'generated insight',
        target: insight.title || 'New insight',
        time: new Date(insight.created_at),
        timeFormatted: new Date(insight.created_at).toLocaleDateString(),
        status: 'completed'
      });
    });

    // Add analyses
    filteredAnalyses.slice(0, 3).forEach(analysis => {
      activity.push({
        id: `an-${analysis.id}`,
        type: 'analysis',
        icon: <BarChart3 className="h-4 w-4" />,
        color: 'text-green-600 bg-green-50 dark:bg-green-900/30',
        user: 'System',
        action: 'completed analysis',
        target: analysis.analysis_type || 'Analysis',
        time: new Date(analysis.created_at),
        timeFormatted: new Date(analysis.created_at).toLocaleDateString(),
        status: 'completed'
      });
    });

    // Sort by date (most recent first) and take latest 5
    const sortedActivity = activity
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);
    
    setRecentActivity(sortedActivity);
    
  }, [datasets, analyses, insights, timeRange]);

  const handleUploadClick = () => {
    router.push('/upload');
  };

  const handleRefresh = () => {
    fetchDatasets();
    refreshInsights();
    refreshAnalyses();
    toast.success('Dashboard refreshed');
  };

  const handleAnalyzeClick = () => {
    if (datasets.length > 0) {
      // Get most recent dataset
      const mostRecentDataset = [...datasets].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )[0];
      router.push(`/analytics?datasetId=${mostRecentDataset.id}`);
    } else {
      toast.error('Please upload a dataset first');
    }
  };

  const handleInsightsClick = () => {
    if (datasets.length > 0) {
      // Get most recent dataset
      const mostRecentDataset = [...datasets].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )[0];
      router.push(`/insights?datasetId=${mostRecentDataset.id}`);
    } else {
      toast.error('Please upload a dataset first');
    }
  };

  // Export as JSON
  const exportAsJSON = () => {
    if (datasets.length === 0) {
      toast.error('No datasets to export');
      return;
    }

    try {
      toast.loading('Preparing JSON export...', { id: 'export' });
      
      // Get the most recent dataset
      const mostRecentDataset = [...datasets].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )[0];
      
      // Create export data
      const exportData = {
        dataset: {
          id: mostRecentDataset.id,
          name: mostRecentDataset.name,
          row_count: mostRecentDataset.row_count,
          column_count: mostRecentDataset.column_count,
          columns: mostRecentDataset.columns,
          created_at: mostRecentDataset.created_at,
          file_size: mostRecentDataset.file_size
        },
        analyses: analyses.filter(a => a.dataset_id === mostRecentDataset.id),
        insights: insights.filter(i => i.dataset_id === mostRecentDataset.id),
        exportedAt: new Date().toISOString(),
        exportedBy: user?.email,
        summary: {
          totalRows: mostRecentDataset.row_count || 0,
          totalColumns: mostRecentDataset.column_count || 0,
          analysesCount: analyses.filter(a => a.dataset_id === mostRecentDataset.id).length,
          insightsCount: insights.filter(i => i.dataset_id === mostRecentDataset.id).length
        }
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `insightforge-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('JSON export completed!', { id: 'export' });
      setShowExportOptions(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.', { id: 'export' });
    }
  };

  // Export as CSV
  const exportAsCSV = () => {
    if (datasets.length === 0) {
      toast.error('No datasets to export');
      return;
    }

    try {
      toast.loading('Preparing CSV export...', { id: 'export' });
      
      // Get the most recent dataset
      const mostRecentDataset = [...datasets].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )[0];
      
      // Create CSV content with dataset metadata
      const rows = [
        ['Dataset Information'],
        ['Name', mostRecentDataset.name],
        ['Rows', mostRecentDataset.row_count || 0],
        ['Columns', mostRecentDataset.column_count || 0],
        ['Created', new Date(mostRecentDataset.created_at).toLocaleString()],
        ['File Size', `${(mostRecentDataset.file_size / (1024 * 1024)).toFixed(2)} MB`],
        [],
        ['Column Names'],
        ...(mostRecentDataset.columns || []).map(col => [col]),
        [],
        ['Analyses'],
        ['ID', 'Type', 'Status', 'Created At']
      ];

      // Add analyses
      const datasetAnalyses = analyses.filter(a => a.dataset_id === mostRecentDataset.id);
      datasetAnalyses.forEach(analysis => {
        rows.push([
          analysis.id,
          analysis.analysis_type,
          analysis.status,
          new Date(analysis.created_at).toLocaleString()
        ]);
      });

      rows.push([], ['Insights'], ['ID', 'Title', 'Type', 'Confidence', 'Created At']);

      // Add insights
      const datasetInsights = insights.filter(i => i.dataset_id === mostRecentDataset.id);
      datasetInsights.forEach(insight => {
        rows.push([
          insight.id,
          insight.title || 'Untitled',
          insight.insight_type || 'general',
          insight.confidence_score || 0,
          new Date(insight.created_at).toLocaleString()
        ]);
      });

      // Convert to CSV
      const csvContent = rows.map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${mostRecentDataset.name || 'export'}-report.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV report exported!', { id: 'export' });
      setShowExportOptions(false);
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Export failed. Please try again.', { id: 'export' });
    }
  };

  // Format time range label for display
  const getTimeRangeLabel = () => {
    const range = timeRanges.find(r => r.value === timeRange);
    return range ? range.label : 'Week';
  };

  // Close export options when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showExportOptions) {
        setShowExportOptions(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportOptions]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! Here's what's happening with your data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  timeRange === range.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                title={`Show data from last ${range.days} days`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <button
            onClick={handleRefresh}
            disabled={dataLoading}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleUploadClick}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Dataset</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title={`Datasets (${getTimeRangeLabel()})`}
          value={filteredStats.totalDatasets.toString()}
          change={`${filteredStats.totalDatasets} total`}
          trend={filteredStats.totalDatasets > 0 ? 'up' : 'neutral'}
          icon={<Database className="h-6 w-6" />}
          color="from-blue-500 to-cyan-500"
          description={`${filteredStats.totalDatasets} in last ${currentTimeRange.days} days`}
        />
        <MetricsCard
          title={`Analyses (${getTimeRangeLabel()})`}
          value={filteredStats.totalAnalyses.toString()}
          change={`${filteredStats.totalAnalyses} total`}
          trend={filteredStats.totalAnalyses > 0 ? 'up' : 'neutral'}
          icon={<BarChart3 className="h-6 w-6" />}
          color="from-purple-500 to-pink-500"
          description={`${filteredStats.totalAnalyses} in last ${currentTimeRange.days} days`}
        />
        <MetricsCard
          title={`Insights (${getTimeRangeLabel()})`}
          value={filteredStats.totalInsights.toString()}
          change={`${filteredStats.totalInsights} total`}
          trend={filteredStats.totalInsights > 0 ? 'up' : 'neutral'}
          icon={<Brain className="h-6 w-6" />}
          color="from-orange-500 to-red-500"
          description={`${filteredStats.totalInsights} in last ${currentTimeRange.days} days`}
        />
        <MetricsCard
          title={`Storage (${getTimeRangeLabel()})`}
          value={filteredStats.storageUsed}
          change="Total storage"
          trend="neutral"
          icon={<Database className="h-6 w-6" />}
          color="from-green-500 to-emerald-500"
          description={`From last ${currentTimeRange.days} days`}
        />
      </div>

      {/* Welcome Banner - Removed mock data and trial text */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-6 w-6" />
              <h2 className="text-xl font-bold">InsightForge AI Platform</h2>
            </div>
            <p className="text-blue-100 mb-4">
              You have {filteredStats.totalDatasets} dataset{filteredStats.totalDatasets !== 1 ? 's' : ''} and {filteredStats.totalInsights} insight{filteredStats.totalInsights !== 1 ? 's' : ''} in the last {currentTimeRange.days} days.
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{filteredStats.totalDatasets}</div>
              <div className="text-sm text-blue-200">Total Datasets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {filteredStats.totalDatasets > 0 ? (filteredStats.totalInsights / filteredStats.totalDatasets).toFixed(1) : 0}
              </div>
              <div className="text-sm text-blue-200">Avg Insights/Dataset</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity {timeRange !== '7d' && `(Last ${currentTimeRange.days} days)`}
              </h2>
            </div>
            <button
              onClick={() => router.push('/datasets')}
              className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${activity.color}`}>
                      {activity.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span className="truncate max-w-[200px]">{activity.target}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-400" />
                        <span>{activity.timeFormatted}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    completed
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No activity in the last {currentTimeRange.days} days
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">All systems operational</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Cloud className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-white">API Service</span>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  healthy
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Response: 120ms</span>
                <span>Status: 200 OK</span>
              </div>
            </div>

            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Database</span>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  connected
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Connections: 5 active</span>
                <span>Size: {filteredStats.storageUsed}</span>
              </div>
            </div>

            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-white">AI Service</span>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  ready
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Model: AI</span>
                <span>{insights.length} insights generated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <Upload className="h-8 w-8 text-blue-600" />
            <Plus className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Upload Data</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Upload CSV, Excel, or JSON files for analysis
          </p>
          <button
            onClick={handleUploadClick}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Now
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Run Analysis</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Perform statistical analysis on your datasets
          </p>
          <button
            onClick={handleAnalyzeClick}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {datasets.length > 0 ? 'Analyze' : 'Upload First'}
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
            <FileText className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">AI Insights</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Generate AI-powered insights and recommendations
          </p>
          <button
            onClick={handleInsightsClick}
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {datasets.length > 0 ? 'Get Insights' : 'Upload First'}
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800 relative">
          <div className="flex items-center justify-between mb-4">
            <Download className="h-8 w-8 text-orange-600" />
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Export Reports</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Export as JSON or CSV
          </p>
          
          {/* Export Button with Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (datasets.length > 0) {
                  setShowExportOptions(!showExportOptions);
                } else {
                  toast.error('No datasets to export');
                }
              }}
              disabled={datasets.length === 0}
              className={`w-full py-2 bg-orange-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                datasets.length === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-orange-700'
              }`}
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            
            {/* Export Options Dropdown */}
            {showExportOptions && datasets.length > 0 && (
              <div className="absolute bottom-full mb-2 left-0 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportAsJSON();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                >
                  <FileJson className="h-4 w-4 text-yellow-500" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">JSON Format</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Export full data as JSON</div>
                  </div>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportAsCSV();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border-t border-gray-100 dark:border-gray-700"
                >
                  <FileCog className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">CSV Format</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Export report as CSV</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}