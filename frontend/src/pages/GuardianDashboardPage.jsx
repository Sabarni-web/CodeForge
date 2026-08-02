import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../features/guardian/guardianDashboardSlice';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, DocumentCheckIcon, FingerPrintIcon } from '@heroicons/react/24/outline';
import Loader from '../components/common/Loader';
import useSocket from '../hooks/useSocket';

const GuardianDashboardPage = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.guardianDashboard);
  const socket = useSocket();

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      dispatch(fetchDashboard());
    };
    socket.on('GuardianDashboardUpdated', handleUpdate);
    return () => {
      socket.off('GuardianDashboardUpdated', handleUpdate);
    };
  }, [socket, dispatch]);

  if (loading && !data) return <Loader text="Loading Guardian Dashboard..." />;
  if (error) return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  if (!data) return null;

  const { overview, repositories, recentVerifications, recentMatches, health } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-emerald-500/20 rounded-xl">
          <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-dark-100">Guardian Dashboard</h1>
          <p className="text-dark-400">Manage your protected assets and view analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-6 border border-emerald-500/30 bg-emerald-900/10">
          <div className="text-dark-400 text-sm font-medium mb-1">Protected Repositories</div>
          <div className="text-3xl font-bold text-emerald-400">{overview.protectedRepositories}</div>
        </div>
        <div className="glass-card p-6 border border-dark-700">
          <div className="text-dark-400 text-sm font-medium mb-1">Certificates Generated</div>
          <div className="text-3xl font-bold text-dark-100">{overview.certificatesGenerated}</div>
        </div>
        <div className="glass-card p-6 border border-dark-700">
          <div className="text-dark-400 text-sm font-medium mb-1">CodeDNA Fingerprints</div>
          <div className="text-3xl font-bold text-dark-100">{overview.dnaGenerated}</div>
        </div>
        <div className="glass-card p-6 border border-dark-700">
          <div className="text-dark-400 text-sm font-medium mb-1">Successful Matches</div>
          <div className="text-3xl font-bold text-dark-100">{overview.verificationsMatched}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 border border-dark-700">
            <h2 className="text-xl font-bold text-dark-100 mb-4">Protected Repositories</h2>
            {repositories.length === 0 ? (
              <p className="text-dark-400">No repositories are currently protected.</p>
            ) : (
              <div className="space-y-4">
                {repositories.map(repo => (
                  <div key={repo._id} className="flex items-center justify-between p-4 bg-dark-900 rounded-lg border border-dark-800 hover:border-emerald-500/50 transition-colors">
                    <div>
                      <Link to={`/repos/${repo._id}`} className="font-semibold text-brand-400 hover:underline">{repo.name}</Link>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className={`flex items-center gap-1 ${repo.hasCertificate ? 'text-emerald-400' : 'text-dark-400'}`}>
                          <DocumentCheckIcon className="w-4 h-4" /> Certificate
                        </span>
                        <span className={`flex items-center gap-1 ${repo.hasDNA ? 'text-emerald-400' : 'text-dark-400'}`}>
                          <FingerPrintIcon className="w-4 h-4" /> CodeDNA
                        </span>
                      </div>
                    </div>
                    {repo.certificateId && (
                      <Link to={`/guardian/certificate/${repo.certificateId}`} className="text-xs btn-secondary">
                        View Certificate
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border border-dark-700">
            <h2 className="text-xl font-bold text-dark-100 mb-4">System Health</h2>
            <div className={`p-4 rounded-lg border ${health.status === 'Excellent' ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400' : health.status === 'Good' ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' : 'bg-dark-800 border-dark-700 text-dark-300'}`}>
              <div className="font-bold mb-1">Status: {health.status}</div>
              <div className="text-sm">{health.message}</div>
            </div>
          </div>

          <div className="glass-card p-6 border border-dark-700">
            <h2 className="text-xl font-bold text-dark-100 mb-4">Recent Verifications</h2>
            {recentVerifications.length === 0 ? (
              <p className="text-sm text-dark-400">No verifications requested yet.</p>
            ) : (
              <div className="space-y-3">
                {recentVerifications.map(report => (
                  <Link key={report._id} to={`/guardian/report/${report.reportId}`} className="block p-3 bg-dark-900 rounded border border-dark-800 hover:border-brand-500 transition-colors">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-dark-200">{new Date(report.createdAt).toLocaleDateString()}</span>
                      <span className={`font-bold ${report.similarityScore >= 80 ? 'text-red-400' : 'text-emerald-400'}`}>{report.similarityScore}% Match</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianDashboardPage;
