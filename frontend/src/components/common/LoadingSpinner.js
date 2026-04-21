'use client';

import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', color = 'primary', fullScreen = false, message = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
    success: 'border-green-600',
    warning: 'border-yellow-600',
    danger: 'border-red-600',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`} />
        <motion.div
          className="absolute inset-0 border-4 border-transparent border-t-current rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {message && (
        <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          {spinner}
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
            Loading InsightForge...
          </p>
        </div>
      </div>
    );
  }

  return spinner;
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="h-20 w-20 border-8 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
        <div className="absolute inset-4 border-8 border-purple-600/30 border-t-purple-600 rounded-full animate-spin animation-delay-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          InsightForge
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Preparing your analytics dashboard...
        </p>
      </div>
    </div>
  </div>
);

export const ChartLoader = ({ height = 300 }) => (
  <div 
    className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center"
    style={{ height: `${height}px` }}
  >
    <LoadingSpinner size="md" color="primary" />
  </div>
);

export const ButtonLoader = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center space-x-2">
    <LoadingSpinner size="sm" color="white" />
    <span>{text}</span>
  </div>
);

export default LoadingSpinner;