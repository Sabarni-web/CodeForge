import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFileContent, updateFile, deleteFile } from '../features/files/fileThunks';
import { fetchRepoById } from '../features/repos/repoThunks';
import { clearCurrentFile } from '../features/files/fileSlice';
import { clearCurrentRepo } from '../features/repos/repoSlice';
import { fetchMembers } from '../features/repos/repositoryCollaboratorSlice';
import CodeEditor from '../components/file/CodeEditor';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { FiArrowLeft, FiTrash2, FiClock, FiSave, FiEdit2 } from 'react-icons/fi';
import { formatFileSize } from '../utils/fileHelpers';
import { timeAgo } from '../utils/dateFormatter';
import toast from 'react-hot-toast';

import FileHistoryDrawer from '../components/sync/FileHistoryDrawer';

import GuardianBadge from '../components/guardian/GuardianBadge';
import { fetchFileCertificate } from '../features/guardian/certificateSlice';
import { fetchFileDNA } from '../features/dna/guardianDnaSlice';
import { FingerPrintIcon } from '@heroicons/react/24/solid';

const FileViewPage = () => {
  const { repoId, fileId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentFile, loading, saving, error } = useSelector((state) => state.files);
  const { currentRepo } = useSelector((state) => state.repos);
  const { user } = useSelector((state) => state.auth);
  const { fileDNA } = useSelector((state) => state.guardianDna);
  const { collaborators } = useSelector((state) => state.repositoryCollaborators);
  const { currentBranch } = useSelector((state) => state.branches);

  const [content, setContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchRepoById(repoId));
    dispatch(fetchFileContent({ repoId, fileId, branch: currentBranch }))
      .unwrap()
      .then((file) => {
        setContent(file.content);
        setCommitMessage(`Update ${file.name}`);
      });
    dispatch(fetchFileCertificate(fileId));
    dispatch(fetchFileDNA(fileId));
    dispatch(fetchMembers(repoId));

    return () => {
      dispatch(clearCurrentFile());
      dispatch(clearCurrentRepo());
    };
  }, [dispatch, repoId, fileId]);

  const canEdit = useMemo(() => {
    if (!currentRepo || !user) return false;
    if (currentRepo.owner?._id === user._id) return true;
    const collab = collaborators?.find((c) => c.user?._id === user._id);
    return collab && collab.role === 'Maintainer';
  }, [currentRepo, user, collaborators]);

  const isOwner = currentRepo && user && (currentRepo.owner?._id === user._id || currentRepo.owner === user._id);

  const hasChanges = currentFile && content !== currentFile.content;

  const handleSave = async () => {
    try {
      await dispatch(updateFile({
        repoId,
        fileId,
        content,
        commitMessage: commitMessage || `Update ${currentFile.name}`,
        branch: currentBranch,
      })).unwrap();
      
      toast.success('File saved successfully');
      // Fetch fresh content to reset state
      dispatch(fetchFileContent({ repoId, fileId, branch: currentBranch }));
    } catch (err) {
      toast.error(err || 'Failed to save file');
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteFile({ repoId, fileId, branch: currentBranch })).unwrap();
      toast.success('File deleted');
      navigate(`/repos/${repoId}`);
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  if (loading && !currentFile) return <Loader size="lg" text="Loading file..." />;

  if (error) {
    return (
      <div className="glass-card p-12 text-center text-red-400">
        <h2 className="text-xl font-bold mb-2">Error loading file</h2>
        <p>{error}</p>
        <Link to={`/repos/${repoId}`} className="btn-secondary mt-6 inline-block">Back to Repository</Link>
      </div>
    );
  }

  if (!currentFile) return null;

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link to={`/repos/${repoId}`} className="p-2 rounded-lg bg-dark-800 text-dark-300 hover:text-dark-100 transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-dark-50">{currentFile.path}</h1>
              <GuardianBadge fileId={fileId} />
              {fileDNA && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1" title="CodeDNA Fingerprint Verified">
                  <FingerPrintIcon className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="text-sm text-dark-400 flex items-center gap-3 mt-1">
              <span>{formatFileSize(currentFile.size)}</span>
              <span>•</span>
              <span>{currentFile.mimeType}</span>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button onClick={() => setDeleteModalOpen(true)} className="btn-danger h-9 px-3 text-sm flex items-center gap-1.5">
              <FiTrash2 /> Delete
            </button>
          </div>
        )}
        {isOwner && (
          <div className="ml-auto flex items-center gap-2">
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="btn-secondary flex items-center gap-2 h-9 px-3"
            >
              <FiClock className="w-4 h-4" /> History
            </button>
            <Link to={`/repos/${repoId}/files/${fileId}/edit`} className="btn-secondary flex items-center gap-2 h-9 px-3">
              <FiEdit2 className="w-4 h-4" /> Edit
            </Link>
          </div>
        )}
      </div>

      {currentFile.lastCommit && !hasChanges && (
        <div className="glass-card mb-4 bg-dark-800/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-blue-900/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-xs">
              U
            </div>
            <span className="font-medium text-dark-200 text-sm">
              <span className="text-brand-400 font-mono mr-2">{currentFile.lastCommit.shortHash}</span>
              {currentFile.lastCommit.message}
            </span>
          </div>
          <div className="text-xs text-dark-400 flex items-center gap-1">
            <FiClock /> {timeAgo(currentFile.lastCommit.createdAt)}
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col min-h-[500px] rounded-t-lg overflow-hidden shadow-2xl relative border ${hasChanges ? 'border-brand-500' : 'border-dark-700'}`}>
        <CodeEditor 
          filename={currentFile.name} 
          content={content} 
          onChange={canEdit ? (val) => setContent(val || '') : undefined} 
          readOnly={!canEdit}
        />
      </div>

      {hasChanges && (
        <div className="shrink-0 bg-dark-900 border border-t-0 border-brand-500 rounded-b-lg p-4 flex flex-col sm:flex-row gap-4 items-center animate-fade-in">
          <div className="flex-1 w-full">
            <input
              type="text"
              className="input-field py-2 bg-dark-950 border-dark-600 focus:border-brand-500"
              placeholder="Commit message..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            <span>Commit changes</span>
          </button>
        </div>
      )}

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete File">
        <p className="text-dark-300 mb-6">
          Are you sure you want to delete <strong className="text-red-400">{currentFile?.path}</strong>? This action will be committed to the repository history.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete file</button>
        </div>
      </Modal>
      <FileHistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        fileId={fileId} 
      />
    </div>
  );
};

export default FileViewPage;
