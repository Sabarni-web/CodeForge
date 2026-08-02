import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiRefreshCw, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Modal from '../common/Modal';
import { commitSync } from '../../features/sync/syncThunks';
import toast from 'react-hot-toast';
import { fetchFileTree } from '../../features/files/fileThunks';

const SyncRepositoryModal = ({ isOpen, onClose, repoId, diff, localFilesContent }) => {
  const dispatch = useDispatch();
  const { isSyncing } = useSelector((state) => state.sync);
  const [commitMessage, setCommitMessage] = useState('');

  if (!diff) return null;

  const { added, modified, deleted } = diff;

  const handleSync = async () => {
    if (!commitMessage.trim()) {
      return toast.error('Commit message is required');
    }

    // Attach content to added and modified files
    const addedWithContent = added.map(f => ({
      ...f,
      content: localFilesContent[f.path] || ''
    }));

    const modifiedWithContent = modified.map(f => ({
      ...f,
      content: localFilesContent[f.path] || ''
    }));

    try {
      await dispatch(commitSync({
        repoId,
        commitMessage,
        added: addedWithContent,
        modified: modifiedWithContent,
        deleted
      })).unwrap();
      
      toast.success('Repository synced successfully!');
      dispatch(fetchFileTree(repoId));
      onClose();
    } catch (err) {
      toast.error(err || 'Failed to sync repository');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sync Changes">
      <div className="space-y-4">
        <p className="text-dark-300 text-sm">
          Review the changes detected in your local folder. Only these files will be uploaded.
        </p>

        <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-dark-300 text-xs font-semibold mb-1">Modified Files</span>
              <span className="text-yellow-400 font-mono text-xl">{modified.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-dark-300 text-xs font-semibold mb-1">Added Files</span>
              <span className="text-green-400 font-mono text-xl">{added.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-dark-300 text-xs font-semibold mb-1">Deleted Files</span>
              <span className="text-red-400 font-mono text-xl">{deleted.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-dark-300 text-xs font-semibold mb-1">Total Changes</span>
              <span className="text-white font-mono text-xl">{added.length + modified.length + deleted.length}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="input-label" htmlFor="commitMessage">Commit Message</label>
          <input
            type="text"
            id="commitMessage"
            className="input-field"
            placeholder="e.g. Added dashboard authentication"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
          />
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button 
            type="button"
            onClick={onClose} 
            disabled={isSyncing}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSync}
            disabled={isSyncing || (added.length === 0 && modified.length === 0 && deleted.length === 0)}
            className="btn-primary w-32 flex justify-center items-center gap-2"
          >
            {isSyncing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><FiRefreshCw /> Sync Changes</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SyncRepositoryModal;
