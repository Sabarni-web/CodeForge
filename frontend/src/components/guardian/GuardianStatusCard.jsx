import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGuardianStatus } from '../../features/guardian/guardianSlice';
import { ShieldCheckIcon, FingerPrintIcon } from '@heroicons/react/24/solid';
import { fetchRepositoryDNA } from '../../features/dna/repositoryDnaSlice';

const GuardianStatusCard = ({ repoId }) => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.guardian);
  const repoStatus = status[repoId];

  const { repositoryDNA, filesProtected, verificationReady } = useSelector((state) => state.repositoryDna);

  useEffect(() => {
    if (repoId && !repoStatus) {
      dispatch(fetchGuardianStatus(repoId));
    }
    if (repoId) {
      dispatch(fetchRepositoryDNA(repoId));
    }
  }, [dispatch, repoId, repoStatus]);

  if (!repoStatus || !repoStatus.guardianEnabled) return null;

  return (
    <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-xl p-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/40">
          <ShieldCheckIcon className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h4 className="text-white font-semibold flex items-center gap-2">
            CodeForge Guardian™
            <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">
              Protected
            </span>
          </h4>
          <p className="text-sm text-green-100/70">
            Source files are protected with ownership certificates.
          </p>
        </div>
      </div>
      
      {verificationReady && repositoryDNA && (
        <div className="mt-4 pt-4 border-t border-green-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FingerPrintIcon className="w-5 h-5 text-green-400" />
            <span className="text-sm font-semibold text-green-100/90">CodeDNA Fingerprint Verified</span>
          </div>
          <div className="text-xs text-green-200/70">
            {filesProtected} Files Protected
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardianStatusCard;
