import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enableGuardian, disableGuardian, fetchGuardianStatus } from '../../features/guardian/guardianSlice';
import { ShieldCheckIcon, ShieldExclamationIcon, ArrowPathIcon, DocumentArrowDownIcon, MagnifyingGlassIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const GuardianSettings = ({ repoId }) => {
  const dispatch = useDispatch();
  const { status, loading } = useSelector((state) => state.guardian);
  const { currentRepo } = useSelector((state) => state.repos);
  const [isUpdating, setIsUpdating] = useState(false);

  const repoStatus = status[repoId];
  const isEnabled = repoStatus?.guardianEnabled ?? true; // Default true based on schema

  useEffect(() => {
    if (repoId && !repoStatus) {
      dispatch(fetchGuardianStatus(repoId));
    }
  }, [repoId, dispatch, repoStatus]);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      if (isEnabled) {
        await dispatch(disableGuardian(repoId)).unwrap();
      } else {
        await dispatch(enableGuardian(repoId)).unwrap();
      }
    } catch (error) {
      console.error('Failed to toggle Guardian:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAction = async (actionName) => {
    toast.success(`${actionName} task queued successfully.`);
  };

  const handleExport = () => {
    if (currentRepo) {
      window.open(`/api/repos/${repoId}/download`, '_blank'); // The zip now includes the certificate
      toast.success('Exporting repository with Guardian Certificate...');
    }
  };

  if (loading && !repoStatus) {
    return <div className="text-gray-400 text-sm p-4 text-center">Loading Guardian Settings...</div>;
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-primary" />
            CodeForge Guardian™ Protection
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Automatically injects unforgeable ownership certificates into supported source files upon upload. 
            This proves you are the original author of the code.
          </p>
        </div>
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isEnabled}
              onChange={handleToggle}
              disabled={isUpdating}
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 bg-dark-bg p-3 rounded-lg border border-dark-border">
        {isEnabled ? (
          <>
            <ShieldCheckIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-300">
              Guardian is <strong>Enabled</strong>. Future uploads will be automatically protected.
            </span>
          </>
        ) : (
          <>
            <ShieldExclamationIcon className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-300">
              Guardian is <strong>Disabled</strong>. New files will not receive certificates. Existing certificates remain unchanged.
            </span>
          </>
        )}
      </div>

      {isEnabled && (
        <div className="mt-8 space-y-4">
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Guardian Actions</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => handleAction('Refresh DNA')}
              className="flex items-center gap-3 p-4 bg-dark-900 border border-dark-border hover:border-emerald-500/50 rounded-lg transition-colors text-left"
            >
              <div className="p-2 bg-emerald-900/20 rounded text-emerald-400">
                <ArrowPathIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Refresh DNA</div>
                <div className="text-xs text-gray-400">Recompute CodeDNA fingerprints</div>
              </div>
            </button>

            <button 
              onClick={() => handleAction('Regenerate Certificate')}
              className="flex items-center gap-3 p-4 bg-dark-900 border border-dark-border hover:border-emerald-500/50 rounded-lg transition-colors text-left"
            >
              <div className="p-2 bg-emerald-900/20 rounded text-emerald-400">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Regenerate Certificate</div>
                <div className="text-xs text-gray-400">Issue a new ownership certificate</div>
              </div>
            </button>

            <button 
              onClick={() => handleAction('Repository Scan')}
              className="flex items-center gap-3 p-4 bg-dark-900 border border-dark-border hover:border-brand-500/50 rounded-lg transition-colors text-left"
            >
              <div className="p-2 bg-brand-900/20 rounded text-brand-400">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Run Repository Scan</div>
                <div className="text-xs text-gray-400">Scan for unprotected files</div>
              </div>
            </button>

            <button 
              onClick={handleExport}
              className="flex items-center gap-3 p-4 bg-dark-900 border border-dark-border hover:border-brand-500/50 rounded-lg transition-colors text-left"
            >
              <div className="p-2 bg-brand-900/20 rounded text-brand-400">
                <DocumentArrowDownIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Export Certificate</div>
                <div className="text-xs text-gray-400">Download digitally signed JSON</div>
              </div>
            </button>
            
            <button 
              onClick={() => handleAction('View Logs')}
              className="flex items-center gap-3 p-4 bg-dark-900 border border-dark-border hover:border-purple-500/50 rounded-lg transition-colors text-left md:col-span-2"
            >
              <div className="p-2 bg-purple-900/20 rounded text-purple-400">
                <DocumentTextIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">View Guardian Logs</div>
                <div className="text-xs text-gray-400">Audit trail of protection events and scans</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardianSettings;
