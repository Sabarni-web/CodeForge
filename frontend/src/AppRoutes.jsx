import { Routes, Route } from 'react-router-dom';
import React, { Suspense } from 'react';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader'; // Assume Loader exists for Suspense fallback

// Pages (Lazy Loaded)
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const RepoListPage = React.lazy(() => import('./pages/RepoListPage'));
const CreateRepoPage = React.lazy(() => import('./pages/CreateRepoPage'));
const RepoDetailPage = React.lazy(() => import('./pages/RepoDetailPage'));
const FileViewPage = React.lazy(() => import('./pages/FileViewPage'));
const FileEditPage = React.lazy(() => import('./pages/FileEditPage'));
const CommitHistoryPage = React.lazy(() => import('./pages/CommitHistoryPage'));
const AIGeneratorPage = React.lazy(() => import('./pages/AIGeneratorPage'));
const MySitesPage = React.lazy(() => import('./pages/MySitesPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SearchUsersPage = React.lazy(() => import('./pages/SearchUsersPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const PublicProfilePage = React.lazy(() => import('./pages/PublicProfilePage'));
const FollowersPage = React.lazy(() => import('./pages/FollowersPage'));
const FollowingPage = React.lazy(() => import('./pages/FollowingPage'));
const RepositorySettingsPage = React.lazy(() => import('./pages/RepositorySettingsPage'));
const RepositorySearchPage = React.lazy(() => import('./pages/RepositorySearchPage'));
const RepositoryNetworkPage = React.lazy(() => import('./pages/RepositoryNetworkPage'));
const GuardianDashboardPage = React.lazy(() => import('./pages/GuardianDashboardPage'));
const PublicVerificationPage = React.lazy(() => import('./pages/PublicVerificationPage'));
const VerificationPage = React.lazy(() => import('./pages/VerificationPage'));
const BranchListPage = React.lazy(() => import('./pages/BranchListPage'));

import AnimatedBackground from './components/layout/AnimatedBackground';

const AppRoutes = () => {
  return (
    <>
      <AnimatedBackground />
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader /></div>}>
      <Routes>
      {/* Public routes wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/guardian/public-verify" element={<PublicVerificationPage />} />
      </Route>

      {/* Auth routes wrapped in AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes wrapped in MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/repos" element={<RepoListPage />} />
        <Route path="/repos/new" element={<CreateRepoPage />} />
        <Route path="/repos/:id" element={<RepoDetailPage />} />
        <Route path="/repos/:id/settings" element={<RepositorySettingsPage />} />
        <Route path="/repos/:id/branches" element={<BranchListPage />} />
        <Route path="/search-repos" element={<RepositorySearchPage />} />
        <Route path="/guardian/verify" element={<VerificationPage />} />
        <Route path="/guardian/report/:id" element={<VerificationPage />} />
        <Route path="/guardian/dashboard" element={<GuardianDashboardPage />} />
        <Route path="/repos/:id/commits" element={<CommitHistoryPage />} />
        <Route path="/repos/:id/network" element={<RepositoryNetworkPage />} />
        <Route path="/repos/:repoId/files/:fileId" element={<FileViewPage />} />
        <Route path="/repos/:repoId/files/:fileId/edit" element={<FileEditPage />} />
        
        <Route path="/ai-generator" element={<AIGeneratorPage />} />
        <Route path="/ai/sites" element={<MySitesPage />} />
        
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search-users" element={<SearchUsersPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile/:username" element={<PublicProfilePage />} />
        <Route path="/profile/:username/followers" element={<FollowersPage />} />
        <Route path="/profile/:username/following" element={<FollowingPage />} />
      </Route>

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <MainLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <h1 className="text-6xl font-bold text-dark-50 mb-4">404</h1>
              <p className="text-xl text-dark-300 mb-8">Page not found</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </MainLayout>
        }
      />
    </Routes>
      </Suspense>
    </>
  );
};

export default AppRoutes;
