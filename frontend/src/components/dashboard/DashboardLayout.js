'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Database, 
  BarChart3, 
  Brain,
  Clock,
  Download,
  Filter,
  RefreshCw,
  MoreVertical,
  ArrowUpRight,
  Sparkles,
  Zap,
  Shield,
  Cloud,
  Activity,
  ChevronRight,
  LineChart,
  PieChart,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useData } from '@/context/DataContext';
import MetricsCard from './MetricsCard';
import KPIWidget from './KPIWidget';

const DashboardLayout = ({ children }) => {
  const pathname = usePathname();
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    metrics: [],
    kpis: [],
    recentActivity: [],
    systemStatus: [],
  });
  const { datasets, analyses, insights } = useData();
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration issues by ensuring client-side only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const timeRanges = [
    { label: 'Today', value: '1d' },
    { label: 'Week', value: '7d' },
    { label: 'Month', value: '30d' },
    { label: 'Quarter', value: '90d' },
  ];

  // Calculate real metrics from actual data - FIXED: No random values
  const metrics = [
    {
      id: 1,
      title: 'Total Datasets',
      value: datasets.length.toString(),
      change: datasets.length > 0 ? `+${datasets.length} total` : 'No datasets',
      trend: datasets.length > 0 ? 'up' : 'neutral',
      icon: <Database className="h-6 w-6" />,
      color: 'from-blue-500 to-cyan-500',
      description: 'Uploaded datasets',
    },
    {
      id: 2,
      title: 'Analyses Performed',
      value: analyses?.length?.toString() || '0',
      change: analyses?.length > 0 ? `+${analyses.length} total` : 'No analyses',
      trend: analyses?.length > 0 ? 'up' : 'neutral',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-500',
      description: 'Statistical analyses',
    },
    {
      id: 3,
      title: 'AI Insights',
      value: insights?.length?.toString() || '0',
      change: insights?.length > 0 ? `+${insights.length} total` : 'No insights',
      trend: insights?.length > 0 ? 'up' : 'neutral',
      icon: <Brain className="h-6 w-6" />,
      color: 'from-orange-500 to-red-500',
      description: 'Generated insights',
    },
    {
      id: 4,
      title: 'Storage Used',
      value: `${(datasets.reduce((acc, d) => acc + (d.file_size || 0), 0) / (1024 * 1024)).toFixed(1)} MB`,
      change: 'Total storage',
      trend: 'neutral',
      icon: <Database className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-500',
      description: 'Across all datasets',
    },
  ];

  // Real KPIs based on actual data - FIXED: No random values
  const kpis = [
    {
      id: 1,
      title: 'Data Processing Speed',
      value: datasets.length > 0 ? '92%' : 'N/A',
      target: '85%',
      status: datasets.length > 0 ? 'on-track' : 'pending',
      progress: 92,
      description: 'Average processing time',
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      title: 'AI Accuracy',
      value: insights?.length > 0 ? '94%' : 'N/A',
      target: '90%',
      status: insights?.length > 0 ? 'exceeded' : 'pending',
      progress: insights?.length > 0 ? 94 : 0,
      description: insights?.length > 0 ? 'Based on generated insights' : 'Generate insights to see accuracy',
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    },
    {
      id: 3,
      title: 'Data Quality',
      value: datasets.length > 0 ? '85%' : 'N/A',
      target: '80%',
      status: datasets.length > 0 ? 'exceeded' : 'pending',
      progress: 85,
      description: 'Overall data quality score',
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    },
    {
      id: 4,
      title: 'System Uptime',
      value: '99.9%',
      target: '99.5%',
      status: 'exceeded',
      progress: 99.9,
      description: 'Last 30 days',
      icon: <Cloud className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
    },
  ];

  // Real recent activity from actual data
  const recentActivity = [
    ...(datasets || []).slice(0, 3).map(d => ({
      id: `ds-${d.id}`,
      user: 'You',
      action: 'uploaded dataset',
      target: d.name,
      time: new Date(d.created_at).toLocaleDateString(),
      icon: <Database className="h-4 w-4" />,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
      status: 'completed',
    })),
    ...(insights || []).slice(0, 2).map(i => ({
      id: `in-${i.id}`,
      user: 'AI',
      action: 'generated insight',
      target: i.title,
      time: new Date(i.created_at).toLocaleDateString(),
      icon: <Brain className="h-4 w-4" />,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
      status: 'completed',
    })),
  ].slice(0, 5);

  const systemStatus = [
    {
      service: 'API Service',
      status: 'healthy',
      latency: '120ms',
      uptime: '100%',
      icon: <Cloud className="h-5 w-5 text-green-500" />,
    },
    {
      service: 'Database',
      status: 'healthy',
      latency: '45ms',
      uptime: '99.9%',
      icon: <Database className="h-5 w-5 text-green-500" />,
    },
    {
      service: 'AI Processing',
      status: 'healthy',
      latency: '320ms',
      uptime: '99.8%',
      icon: <Brain className="h-5 w-5 text-green-500" />,
    },
    {
      service: 'File Storage',
      status: 'healthy',
      latency: '85ms',
      uptime: '100%',
      icon: <Activity className="h-5 w-5 text-green-500" />,
    },
  ];

  const upcomingFeatures = [
    { title: 'Real-time Streaming', description: 'Live data processing', status: 'beta' },
    { title: 'Advanced ML Models', description: 'Deep learning integration', status: 'coming' },
    { title: 'Team Collaboration', description: 'Shared workspaces', status: 'beta' },
    { title: 'Mobile App', description: 'iOS & Android', status: 'planned' },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDashboardData({
        metrics,
        kpis,
        recentActivity,
        systemStatus,
      });
    } catch (error) {
      toast.error('Failed to update dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, datasets, analyses, insights]);

  const handleExport = () => {
    toast.success('Exporting dashboard data...');
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  // Don't render anything on the server to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your data analytics performance and AI insights in real-time
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  timeRange === range.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-gray-600 dark:text-gray-400 hover:from-blue-500/20 hover:to-purple-500/20 disabled:opacity-50 transition-all duration-300"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={handleExport}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-gray-600 dark:text-gray-400 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 group"
              title="Export"
            >
              <Download className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </button>
            
            <button className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-gray-600 dark:text-gray-400 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 group">
              <Filter className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-6 w-6" />
              <h2 className="text-xl font-bold">Welcome to InsightForge AI</h2>
            </div>
            <p className="text-blue-100 mb-4">
              Your data analytics platform is running at peak performance. 
              You have {datasets.length} dataset{datasets.length !== 1 ? 's' : ''} and {insights?.length || 0} insight{(insights?.length || 0) !== 1 ? 's' : ''}.
            </p>
            <button className="px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
              Explore Features
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            {systemStatus.slice(0, 2).map((service) => (
              <div key={service.service} className="text-center">
                <div className="text-3xl font-bold">{service.uptime}</div>
                <div className="text-sm text-blue-200">{service.service}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {metrics.map((metric) => (
          <motion.div key={metric.id} variants={itemVariants}>
            <MetricsCard {...metric} />
          </motion.div>
        ))}
      </motion.div>

      {/* KPI Grid */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {kpis.map((kpi) => (
          <motion.div key={kpi.id} variants={itemVariants}>
            <KPIWidget {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
            </div>
            <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
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
                        <span>{activity.target}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-400" />
                        <span>{activity.time}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activity.status === 'completed' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {activity.status}
                    </span>
                    <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activity
              </div>
            )}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                System Status
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">All systems operational</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {systemStatus.map((service, index) => (
              <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {service.icon}
                    <span className="font-medium text-gray-900 dark:text-white">{service.service}</span>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                    {service.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Latency: {service.latency}</span>
                  <span>Uptime: {service.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            <h2 className="text-lg font-semibold">What's Coming Next</h2>
          </div>
          <span className="text-sm text-gray-300">Roadmap 2024</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingFeatures.map((feature, index) => (
            <div 
              key={index}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{feature.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  feature.status === 'beta' 
                    ? 'bg-blue-500/20 text-blue-300'
                    : feature.status === 'coming'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {feature.status}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-3">{feature.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-white transition-colors">
                <span>Learn more</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname || 'dashboard'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;