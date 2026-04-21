'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Download, 
  Filter, 
  RefreshCw, 
  BarChart3, 
  TrendingUp,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const ChartContainer = ({ 
  title, 
  description, 
  chartType = 'line',
  data = [],
  height = 400,
  config = {},
  onRefresh,
  loading = false,
  error = null
}) => {
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  const timeRanges = [
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
  ];

  const chartTypes = [
    { value: 'line', label: 'Line', icon: <LineChartIcon className="h-4 w-4" /> },
    { value: 'bar', label: 'Bar', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'area', label: 'Area', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'pie', label: 'Pie', icon: <PieChartIcon className="h-4 w-4" /> },
    { value: 'scatter', label: 'Scatter', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'radar', label: 'Radar', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      );
    }

    const commonProps = {
      data: data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {config.dataKeys?.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={COLORS[index % COLORS.length]} 
                name={config.labels?.[key] || key} 
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {config.dataKeys?.map((key, index) => (
              <Area 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                fill={COLORS[index % COLORS.length]} 
                fillOpacity={0.3}
                name={config.labels?.[key] || key}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey={config.valueKey || 'value'}
              nameKey={config.nameKey || 'name'}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {showGrid && <CartesianGrid stroke="#e5e7eb" />}
            <XAxis type="number" dataKey={config.xKey || 'x'} name={config.xLabel || 'X'} />
            <YAxis type="number" dataKey={config.yKey || 'y'} name={config.yLabel || 'Y'} />
            {showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
            {showLegend && <Legend />}
            <Scatter name={config.scatterName || 'Data Points'} data={data} fill="#3b82f6" />
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey={config.nameKey || 'name'} />
            <PolarRadiusAxis />
            {config.dataKeys?.map((key, index) => (
              <Radar 
                key={key}
                name={config.labels?.[key] || key}
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.6}
              />
            ))}
            {showLegend && <Legend />}
          </RadarChart>
        );

      default: // line chart
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {config.dataKeys?.map((key, index) => (
              <Line 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={config.labels?.[key] || key}
              />
            ))}
          </LineChart>
        );
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Implement actual export logic here
      const exportData = {
        chartType,
        data,
        config,
        timeRange
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chart-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Chart data exported successfully');
    } catch (error) {
      toast.error('Failed to export chart data');
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const getChartIcon = () => {
    const type = chartTypes.find(t => t.value === chartType);
    return type ? type.icon : <LineChartIcon className="h-5 w-5" />;
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <BarChart3 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
    >
      {/* Chart Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              {getChartIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Time Range Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timeRange === range.value
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              title="Export"
            >
              <Download className="h-4 w-4" />
            </button>

            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chart Settings */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                showGrid
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {showGrid ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>Grid</span>
            </button>

            <button
              onClick={() => setShowLegend(!showLegend)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                showLegend
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {showLegend ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>Legend</span>
            </button>

            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                showTooltip
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {showTooltip ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>Tooltip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-6">
        {loading ? (
          <div 
            className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"
            style={{ height: `${height}px` }}
          >
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading chart data...
              </p>
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div 
            className="flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            style={{ height: `${height}px` }}
          >
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No data available for this chart
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {data.length} data points • Updated {new Date().toLocaleTimeString()}
          </div>
          
          <div className="flex items-center space-x-3">
            {config.dataKeys?.map((key, index) => (
              <div key={key} className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {config.labels?.[key] || key}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChartContainer;