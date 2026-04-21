'use client';

import { Inter } from 'next/font/google';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicPath) {
      router.push('/login');
    }
  }, [user, loading, isPublicPath, router]);

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For public paths, render immediately
  if (isPublicPath) {
    return children;
  }

  // For protected paths, only render if authenticated
  return user ? children : null;
}

function AppContent({ Component, pageProps }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isLandingPage = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar is only shown on authenticated pages (not on landing, login, register) */}
      {!isLandingPage && !isAuthPage && <Navbar />}
      
      <div className="flex flex-1">
        {/* Sidebar is only shown on authenticated pages */}
        {!isLandingPage && !isAuthPage && <Sidebar />}
        
        <main className={`flex-1 ${!isLandingPage && !isAuthPage ? 'p-6' : ''} overflow-auto`}>
          <PageTransition>
            <Component {...pageProps} />
          </PageTransition>
        </main>
      </div>
      
      {/* Footer only on landing page */}
      {isLandingPage && <Footer />}
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            border: '1px solid #e2e8f0',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>InsightForge - AI-Powered Data Analytics</title>
      </Head>
      <div className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <DataProvider>
              <ProtectedRoute>
                <AppContent Component={Component} pageProps={pageProps} />
              </ProtectedRoute>
            </DataProvider>
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </div>
    </>
  );
}