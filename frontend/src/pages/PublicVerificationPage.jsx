import React, { useState } from 'react';
import { ShieldCheckIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FiSearch } from 'react-icons/fi';
import Loader from '../components/common/Loader';
import api from '../api/axiosConfig';

const PublicVerificationPage = () => {
  // Force HMR to clear browser cache
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.get(`/guardian/certificate/${certId.trim()}`);
      setResult(response.data.data);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-fadeIn">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-emerald-500/20 rounded-full mb-4">
          <ShieldCheckIcon className="w-12 h-12 text-emerald-400" />
        </div>
        <h1 className="text-4xl font-bold text-dark-50 mb-4">CodeForge Guardian Verification</h1>
        <p className="text-dark-300">Enter a Guardian Certificate ID to verify ownership and integrity.</p>
      </div>

      <div className="glass-card p-6 md:p-8">
        <form onSubmit={handleVerify} className="flex gap-4">
          <input 
            type="text"
            className="input-field flex-grow text-lg"
            placeholder="Enter Certificate ID (e.g. CERT-123456...)"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <FiSearch /> Verify
          </button>
        </form>

        <div className="mt-8">
          {loading && <Loader text="Verifying certificate..." />}
          
          {error && (
            <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-xl text-center">
              <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-red-400">Verification Failed</h3>
              <p className="text-red-300/80 mt-2">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-6 bg-emerald-900/20 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-4 mb-6">
                <ShieldCheckIcon className="w-12 h-12 text-emerald-500" />
                <div>
                  <h3 className="text-2xl font-bold text-emerald-400">Certificate Verified</h3>
                  <p className="text-emerald-300/80 text-sm">This is a valid CodeForge Guardian Certificate.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-900 p-4 rounded border border-dark-800">
                  <div className="text-xs text-dark-400 mb-1">Certificate ID</div>
                  <div className="font-mono text-dark-200 break-all">{result.certificateId}</div>
                </div>
                <div className="bg-dark-900 p-4 rounded border border-dark-800">
                  <div className="text-xs text-dark-400 mb-1">Type</div>
                  <div className="text-dark-200">{result.type}</div>
                </div>
                <div className="bg-dark-900 p-4 rounded border border-dark-800">
                  <div className="text-xs text-dark-400 mb-1">Issued Date</div>
                  <div className="text-dark-200">{new Date(result.issuedAt).toLocaleString()}</div>
                </div>
                <div className="bg-dark-900 p-4 rounded border border-dark-800">
                  <div className="text-xs text-dark-400 mb-1">Status</div>
                  <div className="text-emerald-400 font-bold">{result.isValid ? 'Active' : 'Expired'}</div>
                </div>
              </div>

              {result.issuer && (
                <div className="mt-6 p-4 bg-dark-900 border border-dark-800 rounded flex items-center justify-between">
                  <div>
                    <div className="text-xs text-dark-400 mb-1">Verified Owner</div>
                    <div className="font-bold text-brand-400">{result.issuer.username}</div>
                  </div>
                  {result.issuer.avatarUrl && (
                    <img src={result.issuer.avatarUrl} alt="Owner" className="w-10 h-10 rounded-full" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicVerificationPage;
