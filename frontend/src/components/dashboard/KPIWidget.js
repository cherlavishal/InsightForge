'use client';

import { motion } from 'framer-motion';
import { Target, CheckCircle, AlertCircle, TrendingUp, Clock } from 'lucide-react';

const KPIWidget = ({ 
  title, 
  value, 
  target, 
  status, 
  progress, 
  description,
  icon,
  color,
  loading = false 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'exceeded':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'on-track':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'at-risk':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'behind':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'exceeded':
        return <TrendingUp className="h-4 w-4" />;
      case 'on-track':
        return <CheckCircle className="h-4 w-4" />;
      case 'at-risk':
      case 'behind':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            <div className={color.replace('bg-', 'text-')}>
              {icon}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            {!loading && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Target: {target}
              </p>
            )}
          </div>
        </div>
        
        {/* Status Badge */}
        {!loading && (
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="capitalize">{status}</span>
          </div>
        )}
      </div>
      
      {/* Main Value */}
      {loading ? (
        <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
      ) : (
        <div className="flex items-end space-x-2 mb-6">
          <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            current
          </span>
        </div>
      )}
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress to target</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              status === 'exceeded' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              status === 'on-track' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
              status === 'at-risk' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-pink-500'
            }`}
          />
        </div>
      </div>
      
      {/* Description */}
      {loading ? (
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default KPIWidget;