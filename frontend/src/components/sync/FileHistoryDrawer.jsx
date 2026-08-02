import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiClock, FiDownload, FiEye } from 'react-icons/fi';
import { fetchFileVersionHistory } from '../../features/sync/syncThunks';
import { timeAgo } from '../../utils/dateFormatter';
import Loader from '../common/Loader';

const FileHistoryDrawer = ({ isOpen, onClose, fileId }) => {
  const dispatch = useDispatch();
  const { fileHistory, isLoadingFileHistory } = useSelector((state) => state.sync);

  useEffect(() => {
    if (isOpen && fileId) {
      dispatch(fetchFileVersionHistory(fileId));
    }
  }, [isOpen, fileId, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-dark-900 border-l border-dark-700 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      <div className="p-4 border-b border-dark-700 flex justify-between items-center bg-dark-800">
        <h3 className="font-semibold text-dark-100 flex items-center gap-2">
          <FiClock className="text-brand-400" /> File History
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-full text-dark-300 transition-colors">
          <FiX />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingFileHistory ? (
          <Loader size="sm" text="Loading history..." />
        ) : fileHistory.length === 0 ? (
          <p className="text-dark-400 text-sm text-center">No version history found.</p>
        ) : (
          <div className="relative border-l border-dark-700 ml-4 space-y-6">
            {fileHistory.map((version, index) => (
              <div key={version._id} className="relative pl-6">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-dark-900" />
                
                <div className="bg-dark-800 border border-dark-700 p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded-full border border-brand-500/30">
                      Version {version.versionNumber}
                    </span>
                    <span className="text-xs text-dark-400">{timeAgo(version.createdAt)}</span>
                  </div>
                  
                  <p className="text-sm text-dark-200 mb-3 line-clamp-2">
                    {version.commit?.message || 'Update file content'}
                  </p>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-dark-700/50">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center text-[10px] text-white">
                        {version.createdBy?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-xs text-dark-400">{version.createdBy?.username || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="text-xs text-dark-300 hover:text-brand-400 transition-colors" title="View Version">
                        <FiEye />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileHistoryDrawer;
