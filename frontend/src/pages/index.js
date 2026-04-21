'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Upload, 
  BarChart3, 
  Brain, 
  Cloud, 
  Shield, 
  Zap,
  ArrowRight,
  Database,
  TrendingUp,
  Sparkles,
  Cpu,
  LineChart,
  PieChart,
  Activity,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeChart, setActiveChart] = useState(0);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Rotate through chart examples
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChart((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const chartData = [
    {
      type: 'line',
      data: [40, 65, 55, 70, 85, 75, 90, 95, 85, 80, 92, 88],
      color: 'from-blue-500 to-cyan-500',
      label: 'Monthly Active Users'
    },
    {
      type: 'bar',
      data: [45, 52, 38, 45, 58, 40, 45, 52, 58, 62, 55, 48],
      color: 'from-green-500 to-emerald-500',
      label: 'Analyses Performed'
    },
    {
      type: 'area',
      data: [30, 45, 35, 50, 45, 60, 55, 70, 65, 80, 75, 90],
      color: 'from-purple-500 to-pink-500',
      label: 'Insights Generated'
    }
  ];

  const features = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Smart Data Upload",
      description: "Upload CSV, Excel, or JSON files with automatic validation and preprocessing.",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description: "Generate intelligent insights using Google's Gemini AI for data-driven decisions.",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Perform descriptive statistics, correlation analysis, and trend detection.",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: "Cloud Native",
      description: "Built for scalability with cloud deployment on Render and Vercel.",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Enterprise-grade security with encryption and role-based access control.",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Processing",
      description: "Fast data processing with async operations and real-time updates.",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Your Data",
      description: "Drag and drop your CSV, Excel, or JSON files.",
      icon: <Upload className="h-8 w-8" />
    },
    {
      number: "02",
      title: "Analyze & Process",
      description: "Our AI tools clean, analyze, and visualize your data automatically.",
      icon: <Cpu className="h-8 w-8" />
    },
    {
      number: "03",
      title: "Generate Insights",
      description: "Get AI-powered recommendations, predictions, and actionable insights.",
      icon: <Brain className="h-8 w-8" />
    },
    {
      number: "04",
      title: "Make Decisions",
      description: "Use insights to drive business decisions and strategy with confidence.",
      icon: <TrendingUp className="h-8 w-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50" />
                <div className="relative h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                InsightForge
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium">
                How It Works
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Dashboard Preview */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20 mb-8">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  AI-Powered Analytics Platform
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Transform Data
                </span>
                <br />
                into Intelligence
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 mt-6 max-w-lg">
                Harness the power of AI to uncover hidden patterns, predict trends, and make data-driven decisions with confidence.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href="/register"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Right Visual - Clean Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Dashboard Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-400"></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Dashboard Preview</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 space-y-4">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-2 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Database className="h-4 w-4 text-blue-600 dark:text-blue-400 mb-1" />
                      <div className="text-xs text-blue-600 dark:text-blue-400">Datasets</div>
                     
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-2 rounded-lg border border-green-200 dark:border-green-800">
                      <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400 mb-1" />
                      <div className="text-xs text-green-600 dark:text-green-400">Analyses</div>
                      
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
                      <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400 mb-1" />
                      <div className="text-xs text-purple-600 dark:text-purple-400">Insights</div>
                      
                    </div>
                  </div>

                  {/* Animated Chart */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {chartData[activeChart].label}
                      </span>
                      <div className="flex gap-1">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${chartData[0].color}`} />
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${chartData[1].color}`} />
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${chartData[2].color}`} />
                      </div>
                    </div>
                    <div className="h-16 flex items-end gap-1">
                      {chartData[activeChart].data.slice(0, 12).map((value, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${value}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className={`flex-1 bg-gradient-to-t ${chartData[activeChart].color} rounded-t-sm`}
                          style={{ height: `${value}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Mini Pie Chart Preview */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="relative w-12 h-12">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="40" fill="#8884d8" fillOpacity="0.3" />
                        <path d="M50,10 A40,40 0 0,1 85,35 L50,50 Z" fill="#8884d8" />
                        <path d="M50,50 L85,35 A40,40 0 0,1 50,90 Z" fill="#82ca9d" />
                        <path d="M50,50 L50,90 A40,40 0 0,1 15,35 L50,50 Z" fill="#ffc658" />
                      </svg>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#8884d8]" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Uploads</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#82ca9d]" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Analyses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#ffc658]" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Insights</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20 mb-4"
            >
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Powerful Features
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Succeed</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.iconBg} mb-6`}>
                  <div className={feature.iconColor}>
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              From Data to Decisions in
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> 4 Steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto shadow-xl">
                  {step.icon}
                </div>
                
                <div className="text-5xl font-bold text-gray-200 dark:text-gray-800 mb-2">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative z-10"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Ready to Transform Your Data?
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300 shadow-xl"
                >
                  Start Free Trial
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Simple Footer */}
      
    </div>
  );
}