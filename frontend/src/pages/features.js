'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Brain,
  BarChart3,
  Database,
  Shield,
  Zap,
  Cloud,
  Users,
  TrendingUp,
  Target,
  LineChart,
  PieChart,
  Download,
  Share2,
  Lock,
  Globe,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function FeaturesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const features = [
    {
      category: 'analytics',
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Advanced Analytics',
      description: 'Perform complex statistical analysis with just a few clicks.',
      details: [
        'Descriptive statistics with visual summaries',
        'Correlation analysis with heatmaps',
        'Trend detection and seasonality analysis',
        'Anomaly detection algorithms',
        'Customizable dashboards',
        'Real-time data processing'
      ],
      color: 'from-blue-500 to-cyan-500',
      image: '/features/analytics.svg'
    },
    {
      category: 'ai',
      icon: <Brain className="h-6 w-6" />,
      title: 'AI-Powered Insights',
      description: 'Let AI analyze your data and provide actionable insights.',
      details: [
        'Natural language insights generation',
        'Predictive modeling and forecasting',
        'Automated pattern recognition',
        'Smart recommendations',
        'Confidence scoring',
        'Explainable AI results'
      ],
      color: 'from-purple-500 to-pink-500',
      image: '/features/ai.svg'
    },
    {
      category: 'visualization',
      icon: <LineChart className="h-6 w-6" />,
      title: 'Interactive Visualizations',
      description: 'Create stunning charts and dashboards from your data.',
      details: [
        '20+ chart types and visualizations',
        'Interactive dashboards',
        'Real-time updates',
        'Export to PNG, PDF, SVG',
        'Custom color schemes',
        'Responsive designs'
      ],
      color: 'from-green-500 to-emerald-500',
      image: '/features/visualization.svg'
    },
    {
      category: 'data',
      icon: <Database className="h-6 w-6" />,
      title: 'Data Management',
      description: 'Easily upload, clean, and manage your datasets.',
      details: [
        'Upload CSV, Excel, JSON files',
        'Automatic data validation',
        'Missing value handling',
        'Data type detection',
        'Version control',
        'Data preview and sampling'
      ],
      color: 'from-orange-500 to-red-500',
      image: '/features/data.svg'
    },
    {
      category: 'collaboration',
      icon: <Users className="h-6 w-6" />,
      title: 'Team Collaboration',
      description: 'Work together with your team on data projects.',
      details: [
        'Shared workspaces',
        'Real-time collaboration',
        'Comments and annotations',
        'Permission management',
        'Activity tracking',
        'Team analytics'
      ],
      color: 'from-indigo-500 to-purple-500',
      image: '/features/collaboration.svg'
    },
    {
      category: 'security',
      icon: <Shield className="h-6 w-6" />,
      title: 'Enterprise Security',
      description: 'Your data is safe with enterprise-grade security.',
      details: [
        'End-to-end encryption',
        'Role-based access control',
        'Audit logging',
        'SSO integration',
        'GDPR compliance',
        'Regular security audits'
      ],
      color: 'from-red-500 to-pink-500',
      image: '/features/security.svg'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Features', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'ai', label: 'AI & ML', icon: <Brain className="h-4 w-4" /> },
    { id: 'visualization', label: 'Visualization', icon: <LineChart className="h-4 w-4" /> },
    { id: 'data', label: 'Data Management', icon: <Database className="h-4 w-4" /> },
    { id: 'collaboration', label: 'Collaboration', icon: <Users className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> }
  ];

  const filteredFeatures = activeTab === 'all' 
    ? features 
    : features.filter(f => f.category === activeTab);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Powerful Features</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Everything You Need to
            <br />Transform Your Data
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            From advanced analytics to AI-powered insights, InsightForge provides a complete toolkit 
            for data-driven decision making.
          </p>
        </motion.div>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 overflow-hidden group"
            >
              <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
              <div className="p-6">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <div className={`text-transparent bg-clip-text bg-gradient-to-r ${feature.color}`}>
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {feature.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {feature.details.slice(0, 4).map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={user ? '/dashboard' : '/register'}
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:gap-3 transition-all"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Datasets Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Insights Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto text-center px-4">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Data?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of organizations making data-driven decisions with InsightForge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={user ? '/dashboard' : '/register'}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transform hover:-translate-y-1 transition-all duration-300"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}