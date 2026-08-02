import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFileContent, updateFile, deleteFile } from '../features/files/fileThunks';
import CodeEditor from '../components/file/CodeEditor';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { FiArrowLeft, FiSave, FiX, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FileEditPage = () => {
  const { repoId, fileId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentFile, loading, saving } = useSelector((state) => state.files);
  const { currentBranch } = useSelector((state) => state.branches);
  const [content, setContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchFileContent({ repoId, fileId, branch: currentBranch }))
      .unwrap()
      .then((file) => {
        setContent(file.content);
        setCommitMessage(`Update ${file.name}`);
      });
  }, [dispatch, repoId, fileId, currentBranch]);

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
      navigate(`/repos/${repoId}/files/${fileId}`);
    } catch (error) {
      toast.error(error || 'Failed to save file');
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteFile({ repoId, fileId, branch: currentBranch })).unwrap();
      toast.success('File deleted');
      navigate(`/repos/${repoId}`);
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  if (loading && !content) return <Loader size="lg" text="Loading editor..." />;
  if (!currentFile) return null;

  const hasChanges = content !== currentFile.content;

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link to={`/repos/${repoId}/files/${fileId}`} className="p-2 rounded-lg bg-dark-800 text-dark-300 hover:text-dark-100 transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-dark-50">Editing {currentFile.path}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setDeleteModalOpen(true)} className="btn-danger h-9 px-3 text-sm flex items-center gap-1.5">
            <FiTrash2 /> Delete
          </button>
          <Link to={`/repos/${repoId}/files/${fileId}`} className="btn-secondary h-9 px-4 text-sm">
            Cancel
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-[500px] rounded-lg overflow-hidden shadow-2xl relative border border-brand-500">
        <CodeEditor 
          filename={currentFile.name} 
          content={content} 
          onChange={(val) => setContent(val || '')} 
        />
      </div>

      {/* Commit Panel */}
      <div className="shrink-0 bg-dark-900 border border-t-0 border-dark-700 rounded-b-lg p-4 flex flex-col sm:flex-row gap-4 items-center">
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
          disabled={!hasChanges || saving}
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

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete File">
        <p className="text-dark-300 mb-6">
          Are you sure you want to delete <strong className="text-red-400">{currentFile.path}</strong>? This action will be committed to the repository history.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete file</button>
        </div>
      </Modal>
    </div>
  );
};

export default FileEditPage;
