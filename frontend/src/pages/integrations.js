'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Cloud,
  Database,
  Globe,
  Mail,
  Calendar,
  FileText,
  BarChart3,
  PieChart,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  Download,
  Upload,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [connecting, setConnecting] = useState({});

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'storage', label: 'Storage' },
    { id: 'database', label: 'Databases' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'communication', label: 'Communication' },
    { id: 'crm', label: 'CRM' }
  ];

  const integrations = [
    {
      id: 'aws-s3',
      name: 'AWS S3',
      description: 'Connect to Amazon S3 buckets for data storage and retrieval.',
      category: 'storage',
      icon: <Cloud className="h-6 w-6" />,
      color: 'from-orange-500 to-yellow-500',
      features: [
        'Read/write CSV, JSON, Parquet',
        'Automatic data versioning',
        'Bucket management',
        'Secure IAM integration'
      ],
      docs: '/docs/integrations/aws-s3',
      status: 'active',
      popular: true
    },
    {
      id: 'google-cloud-storage',
      name: 'Google Cloud Storage',
      description: 'Integrate with Google Cloud Storage for scalable data storage.',
      category: 'storage',
      icon: <Cloud className="h-6 w-6" />,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Multi-region support',
        'Automatic encryption',
        'Lifecycle management',
        'Cloud CDN integration'
      ],
      docs: '/docs/integrations/gcs',
      status: 'active',
      popular: true
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      description: 'Connect directly to PostgreSQL databases for real-time analytics.',
      category: 'database',
      icon: <Database className="h-6 w-6" />,
      color: 'from-blue-600 to-indigo-600',
      features: [
        'Direct SQL queries',
        'Schema discovery',
        'Incremental updates',
        'Connection pooling'
      ],
      docs: '/docs/integrations/postgresql',
      status: 'active',
      popular: true
    },
    {
      id: 'mysql',
      name: 'MySQL',
      description: 'Seamless integration with MySQL databases.',
      category: 'database',
      icon: <Database className="h-6 w-6" />,
      color: 'from-orange-600 to-red-600',
      features: [
        'Query optimization',
        'Index recommendations',
        'Replication support',
        'SSL encryption'
      ],
      docs: '/docs/integrations/mysql',
      status: 'active',
      popular: false
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      description: 'Connect to MongoDB for NoSQL data analysis.',
      category: 'database',
      icon: <Database className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-500',
      features: [
        'JSON document support',
        'Aggregation pipelines',
        'Atlas integration',
        'Change streams'
      ],
      docs: '/docs/integrations/mongodb',
      status: 'beta',
      popular: false
    },
    {
      id: 'snowflake',
      name: 'Snowflake',
      description: 'Enterprise data warehouse integration.',
      category: 'database',
      icon: <Database className="h-6 w-6" />,
      color: 'from-blue-400 to-cyan-400',
      features: [
        'Zero-copy cloning',
        'Time travel',
        'Secure data sharing',
        'Query acceleration'
      ],
      docs: '/docs/integrations/snowflake',
      status: 'beta',
      popular: true
    },
    {
      id: 'tableau',
      name: 'Tableau',
      description: 'Export visualizations directly to Tableau.',
      category: 'analytics',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-500',
      features: [
        'One-click export',
        'Live data connections',
        'Dashboard embedding',
        'Cross-filtering'
      ],
      docs: '/docs/integrations/tableau',
      status: 'active',
      popular: true
    },
    {
      id: 'power-bi',
      name: 'Power BI',
      description: 'Integrate with Microsoft Power BI.',
      category: 'analytics',
      icon: <PieChart className="h-6 w-6" />,
      color: 'from-yellow-500 to-orange-500',
      features: [
        'DirectQuery support',
        'Custom visuals',
        'Row-level security',
        'Scheduled refresh'
      ],
      docs: '/docs/integrations/powerbi',
      status: 'active',
      popular: true
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send alerts and insights directly to Slack channels.',
      category: 'communication',
      icon: <Mail className="h-6 w-6" />,
      color: 'from-purple-400 to-pink-400',
      features: [
        'Custom notifications',
        'Interactive messages',
        'Channel management',
        'Thread support'
      ],
      docs: '/docs/integrations/slack',
      status: 'active',
      popular: false
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Integrate with Microsoft Teams for collaboration.',
      category: 'communication',
      icon: <Users className="h-6 w-6" />,
      color: 'from-blue-500 to-indigo-500',
      features: [
        'Adaptive cards',
        'Tab integration',
        'Bot framework',
        'Meeting insights'
      ],
      docs: '/docs/integrations/teams',
      status: 'beta',
      popular: false
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Connect to Salesforce for CRM analytics.',
      category: 'crm',
      icon: <Users className="h-6 w-6" />,
      color: 'from-blue-600 to-cyan-600',
      features: [
        'Object sync',
        'Report integration',
        'Custom fields',
        'SOQL queries'
      ],
      docs: '/docs/integrations/salesforce',
      status: 'development',
      popular: true
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Analyze marketing and sales data from HubSpot.',
      category: 'crm',
      icon: <Globe className="h-6 w-6" />,
      color: 'from-orange-500 to-red-500',
      features: [
        'Contact analytics',
        'Deal tracking',
        'Email engagement',
        'Custom properties'
      ],
      docs: '/docs/integrations/hubspot',
      status: 'development',
      popular: false
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConnect = (integrationId) => {
    if (!user) {
      toast.error('Please login to connect integrations');
      return;
    }

    setConnecting(prev => ({ ...prev, [integrationId]: true }));
    
    // Simulate connection
    setTimeout(() => {
      setConnecting(prev => ({ ...prev, [integrationId]: false }));
      toast.success(`Connected to ${integrationId} successfully!`);
    }, 2000);
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integrations</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your favorite tools and services to InsightForge
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Integrations Banner */}
      {selectedCategory === 'all' && searchTerm === '' && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Popular Integrations</h2>
              <p className="text-green-100">
                Connect with the tools you already use and love
              </p>
            </div>
            <Zap className="h-12 w-12 opacity-50" />
          </div>
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 overflow-hidden group"
          >
            <div className={`h-2 bg-gradient-to-r ${integration.color}`} />
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${integration.color} bg-opacity-10 flex items-center justify-center`}>
                  <div className={`text-transparent bg-clip-text bg-gradient-to-r ${integration.color}`}>
                    {integration.icon}
                  </div>
                </div>
                
                <span className={`px-2 py-1 text-xs rounded-full ${
                  integration.status === 'active' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : integration.status === 'beta'
                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {integration.status}
                </span>
              </div>

              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {integration.name}
                </h3>
                {integration.popular && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                    Popular
                  </span>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {integration.description}
              </p>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features:</h4>
                <ul className="space-y-1">
                  {integration.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2">
                {user ? (
                  <button
                    onClick={() => handleConnect(integration.id)}
                    disabled={connecting[integration.id]}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {connecting[integration.id] ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Connect
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg text-center"
                  >
                    Login to Connect
                  </Link>
                )}
                
                <Link
                  href={integration.docs}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No integrations found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Request Integration */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Don't see what you need?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We're constantly adding new integrations. Let us know what you'd like to see.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg"
        >
          Request Integration
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}