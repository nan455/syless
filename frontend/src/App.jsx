import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useStore from '@store/useStore';
import LoadingScreen from '@components/shared/LoadingScreen';

// Lazy-loaded pages for optimal performance
const Landing = lazy(() => import('@pages/Landing'));
const IDE = lazy(() => import('@pages/IDE'));
const DSAPlayground = lazy(() => import('@pages/DSAPlayground'));
const AITutor = lazy(() => import('@pages/AITutor'));
const Dashboard = lazy(() => import('@pages/Dashboard'));
const Admin = lazy(() => import('@pages/Admin'));
const Auth = lazy(() => import('@pages/Auth'));
const NotFound = lazy(() => import('@pages/NotFound'));
const Learn = lazy(() => import('@pages/Learn'));
const ModuleView = lazy(() => import('@pages/ModuleView'));

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useStore();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/ide" replace />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/ide" element={<IDE />} />
        <Route
          path="/dsa"
          element={
            <ProtectedRoute>
              <DSAPlayground />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-tutor"
          element={
            <ProtectedRoute>
              <AITutor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/:slug"
          element={
            <ProtectedRoute>
              <ModuleView />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
