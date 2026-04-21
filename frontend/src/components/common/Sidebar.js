'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  Database,
  BarChart3,
  Brain,
  Settings,
  ChevronLeft,
  Home,
  Upload,
  TrendingUp,
  Zap,
  Eye,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { datasets, storageStats } = useData();

  // Calculate storage stats
  const totalStorageGB = 4;
  const usedStorageGB = storageStats?.totalGB || 
    datasets.reduce((sum, dataset) => sum + (dataset.file_size || 0), 0) / (1024 * 1024 * 1024);
  const storagePercentage = Math.min((usedStorageGB / totalStorageGB) * 100, 100);

  // Don't show sidebar on login/register pages
  if (pathname === '/login' || pathname === '/register' || !user) {
    return null;
  }

  // Main navigation items
  const mainNavItems = [
    {
      title: 'Main',
      icon: <LayoutDashboard className="h-5 w-5" />,
      items: [
        { icon: <Home className="h-4 w-4" />, label: 'Dashboard', href: '/' },
        { icon: <Database className="h-4 w-4" />, label: 'Datasets', href: '/datasets' },
        { icon: <Upload className="h-4 w-4" />, label: 'Upload Data', href: '/upload', badge: 'New' },
        { icon: <BarChart3 className="h-4 w-4" />, label: 'Analytics', href: '/analytics' },
        { icon: <Brain className="h-4 w-4" />, label: 'Insights', href: '/insights' },
        { icon: <Eye className="h-4 w-4" />, label: 'Visualizations', href: '/visualizations' },
      ]
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      items: [
        { icon: <Settings className="h-4 w-4" />, label: 'Settings', href: '/settings' },
      ]
    }
  ];

  const quickActions = [
    { 
      icon: <Upload className="h-4 w-4" />, 
      label: 'Upload Data', 
      href: '/upload', 
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    { 
      icon: <Zap className="h-4 w-4" />, 
      label: 'Quick Analysis', 
      href: '/analytics', 
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    { 
      icon: <Sparkles className="h-4 w-4" />, 
      label: 'AI Insights', 
      href: '/insights', 
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
  ];

  return (
    <aside className={`hidden lg:flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-500 ease-in-out ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute -right-3 top-8 z-10 h-6 w-6 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all duration-300 ${
          collapsed ? 'rotate-180' : ''
        }`}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Logo */}
      <div className={`p-5 border-b border-gray-200 dark:border-gray-800 ${collapsed ? 'px-5 py-5' : 'px-5 py-5'}`}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative h-9 w-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                InsightForge
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                AI Analytics Platform
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Quick Actions - Only show when expanded */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Quick Actions
            </h3>
            <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
                <div className="relative flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-400 transition-all duration-300">
                  <div className={`h-8 w-8 rounded-lg ${action.color} flex items-center justify-center shadow-md`}>
                    <div className="text-white">{action.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {action.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Click to start
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {mainNavItems.map((section) => (
          <div key={section.title} className="mb-6 px-3">
            {!collapsed && (
              <div className="flex items-center gap-2 px-2 mb-3">
                <div className="text-gray-500 dark:text-gray-400">
                  {section.icon}
                </div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`group relative flex items-center ${collapsed ? 'justify-center px-3' : 'px-3'} py-2.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title={collapsed ? item.label : ''}
                  >
                    <div className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'} ${
                      collapsed ? '' : 'mr-3'
                    }`}>
                      {item.icon}
                    </div>
                    
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isActive 
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section - Storage */}
      <div className={`border-t border-gray-200 dark:border-gray-800 p-4 ${collapsed ? 'px-4' : 'px-4'}`}>
        {!collapsed ? (
          <div className="p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Storage</span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {storagePercentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{usedStorageGB.toFixed(1)} GB used</span>
              <span>{totalStorageGB} GB total</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div 
              className="relative h-7 w-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold cursor-help"
              title={`${storagePercentage.toFixed(1)}% storage used`}
            >
              {Math.round(storagePercentage)}%
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;