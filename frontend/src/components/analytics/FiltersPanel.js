'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  Calendar, 
  Tag, 
  Users, 
  TrendingUp,
  RefreshCw,
  Save,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const FiltersPanel = ({ 
  onFilterChange,
  filters: externalFilters = {},
  availableFilters = [],
  showPanel = true,
  onTogglePanel
}) => {
  const [filters, setFilters] = useState({
    dateRange: externalFilters.dateRange || '',
    categories: externalFilters.categories || [],
    status: externalFilters.status || '',
    users: externalFilters.users || [],
    minValue: externalFilters.minValue || '',
    maxValue: externalFilters.maxValue || '',
    tags: externalFilters.tags || [],
    sortBy: externalFilters.sortBy || 'date',
    sortOrder: externalFilters.sortOrder || 'desc',
    ...externalFilters
  });

  const [expandedSections, setExpandedSections] = useState({
    date: true,
    categories: false,
    advanced: false
  });

  const dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'Custom range', value: 'custom' },
  ];

  const statuses = [
    { id: 'all', label: 'All Statuses' },
    { id: 'active', label: 'Active', color: 'bg-green-500' },
    { id: 'pending', label: 'Pending', color: 'bg-yellow-500' },
    { id: 'completed', label: 'Completed', color: 'bg-blue-500' },
    { id: 'failed', label: 'Failed', color: 'bg-red-500' },
  ];

  const sortOptions = [
    { id: 'date', label: 'Date' },
    { id: 'value', label: 'Value' },
    { id: 'name', label: 'Name' },
    { id: 'category', label: 'Category' },
  ];

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (categoryId) => {
    setFilters(prev => {
      const currentCategories = [...prev.categories];
      const index = currentCategories.indexOf(categoryId);
      
      if (index === -1) {
        currentCategories.push(categoryId);
      } else {
        currentCategories.splice(index, 1);
      }
      
      return { ...prev, categories: currentCategories };
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleReset = () => {
    setFilters({
      dateRange: '',
      categories: [],
      status: '',
      users: [],
      minValue: '',
      maxValue: '',
      tags: [],
      sortBy: 'date',
      sortOrder: 'desc',
    });
    toast.success('Filters reset');
  };

  const handleSavePreset = () => {
    // Save to localStorage or backend
    const presets = JSON.parse(localStorage.getItem('filterPresets') || '[]');
    const presetName = prompt('Enter preset name:');
    if (presetName) {
      presets.push({ name: presetName, filters });
      localStorage.setItem('filterPresets', JSON.stringify(presets));
      toast.success('Filter preset saved');
    }
  };

  const handleExportFilters = () => {
    const dataStr = JSON.stringify(filters, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filters-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Filters exported');
  };

  const activeFilterCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value !== '' && value !== 'all' && value !== 'date';
    return false;
  }).length;

  if (!showPanel) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Filter className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Filters
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Reset filters"
          >
            <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          {onTogglePanel && (
            <button
              onClick={onTogglePanel}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Close filters"
            >
              <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Date Range Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('date')}
          className="flex items-center justify-between w-full mb-3"
        >
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Date Range
            </span>
          </div>
          {expandedSections.date ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSections.date && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {dateRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handleFilterChange('dateRange', range.value)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      filters.dateRange === range.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              
              {filters.dateRange === 'custom' && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories Section */}
      {availableFilters.categories && availableFilters.categories.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Categories
              </span>
            </div>
            {expandedSections.categories ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          <AnimatePresence>
            {expandedSections.categories && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {availableFilters.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                        filters.categories.includes(category.id)
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {category.color && (
                          <div className={`h-3 w-3 rounded-full ${category.color}`} />
                        )}
                        <span className="text-gray-700 dark:text-gray-300">
                          {category.label}
                        </span>
                      </div>
                      {filters.categories.includes(category.id) && (
                        <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Status Filter */}
      {availableFilters.statuses && availableFilters.statuses.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Status
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {availableFilters.statuses.map((status) => (
              <button
                key={status.id}
                onClick={() => handleFilterChange('status', status.id)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filters.status === status.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('advanced')}
          className="flex items-center justify-between w-full mb-3"
        >
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Advanced Filters
            </span>
          </div>
          {expandedSections.advanced ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSections.advanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-4"
            >
              {/* Value Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Value Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minValue}
                    onChange={(e) => handleFilterChange('minValue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxValue}
                    onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <div className="flex items-center space-x-3">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {filters.sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Filters
            </span>
            <button
              onClick={handleReset}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Clear all
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters.dateRange && filters.dateRange !== 'date' && (
              <div className="inline-flex items-center px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm">
                Date: {dateRanges.find(r => r.value === filters.dateRange)?.label}
                <button
                  onClick={() => handleFilterChange('dateRange', '')}
                  className="ml-2 hover:text-primary-900 dark:hover:text-primary-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.categories.map((catId) => {
              const category = availableFilters.categories?.find(c => c.id === catId);
              if (!category) return null;
              
              return (
                <div
                  key={catId}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {category.color && (
                    <div className={`h-2 w-2 rounded-full ${category.color} mr-2`} />
                  )}
                  {category.label}
                  <button
                    onClick={() => toggleCategory(catId)}
                    className="ml-2 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
            
            {filters.status && filters.status !== 'all' && (
              <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                Status: {availableFilters.statuses?.find(s => s.id === filters.status)?.label}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-2 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {(filters.minValue || filters.maxValue) && (
              <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                Value: {filters.minValue || '0'} - {filters.maxValue || '∞'}
                <button
                  onClick={() => {
                    handleFilterChange('minValue', '');
                    handleFilterChange('maxValue', '');
                  }}
                  className="ml-2 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSavePreset}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Save Preset</span>
        </button>
        
        <button
          onClick={handleExportFilters}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Filters</span>
        </button>
      </div>
    </motion.div>
  );
};

export default FiltersPanel;