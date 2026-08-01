import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RepoListPage from './pages/RepoListPage';
import CreateRepoPage from './pages/CreateRepoPage';
import RepoDetailPage from './pages/RepoDetailPage';
import FileViewPage from './pages/FileViewPage';
import FileEditPage from './pages/FileEditPage';
import CommitHistoryPage from './pages/CommitHistoryPage';
import AIGeneratorPage from './pages/AIGeneratorPage';
import MySitesPage from './pages/MySitesPage';
import ProfilePage from './pages/ProfilePage';
import SearchUsersPage from './pages/SearchUsersPage';
import NotificationsPage from './pages/NotificationsPage';
import PublicProfilePage from './pages/PublicProfilePage';
import FollowersPage from './pages/FollowersPage';
import FollowingPage from './pages/FollowingPage';
import RepositorySettingsPage from './pages/RepositorySettingsPage';
import RepositorySearchPage from './pages/RepositorySearchPage';
import RepositoryNetworkPage from './pages/RepositoryNetworkPage';

import AnimatedBackground from './components/layout/AnimatedBackground';

const AppRoutes = () => {
  return (
    <>
      <AnimatedBackground />
      <Routes>
      {/* Public routes wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
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
        <Route path="/search-repos" element={<RepositorySearchPage />} />
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
    </>
  );
};

export default AppRoutes;
