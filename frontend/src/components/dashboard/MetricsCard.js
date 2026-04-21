'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricsCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color,
  description,
  loading = false 
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-12 translate-x-12 ${color} opacity-10`} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          ) : (
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {value}
            </h3>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <div className={color.replace('bg-', 'text-')}>
            {icon}
          </div>
        </div>
      </div>
      
      {/* Trend Indicator */}
      <div className="flex items-center justify-between">
        {loading ? (
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ) : (
          <>
            <div className="flex items-center space-x-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {change}
              </span>
            </div>
            
            {/* Description */}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </span>
          </>
        )}
      </div>
      
      {/* Progress Bar - Optional, only show if trend is up/down */}
      {trend !== 'neutral' && !loading && (
        <div className="mt-4">
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: trend === 'up' ? '75%' : '45%' }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${trend === 'up' ? 'bg-green-500' : 'bg-red-500'} rounded-full`}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MetricsCard;