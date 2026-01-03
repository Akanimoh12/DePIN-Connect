import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import { WalletProvider } from './contexts/WalletContext';
import { ToastProvider } from './contexts/ToastContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MySubscriptions = lazy(() => import('./pages/MySubscriptions'));
const PitchDeck = lazy(() => import('./pages/PitchDeck'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <ToastProvider>
          <Router>
          <div className="min-h-screen bg-background text-white">
            <Header />
            <div className="flex container mx-auto pt-8 px-6">
              <Sidebar />
              <main className="flex-1 lg:ml-8">
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Marketplace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/subscriptions" element={<MySubscriptions />} />
                    <Route path="/pitch" element={<PitchDeck />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </WalletProvider>
    </ErrorBoundary>
  );
}

export default App;
