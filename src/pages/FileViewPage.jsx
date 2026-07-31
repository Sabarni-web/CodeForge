import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFileContent } from '../features/files/fileThunks';
import { clearCurrentFile } from '../features/files/fileSlice';
import CodeEditor from '../components/file/CodeEditor';
import Loader from '../components/common/Loader';
import { FiArrowLeft, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import { formatFileSize } from '../utils/fileHelpers';
import { timeAgo } from '../utils/dateFormatter';

const FileViewPage = () => {
  const { repoId, fileId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentFile, loading, error } = useSelector((state) => state.files);
  const { currentRepo } = useSelector((state) => state.repos);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchFileContent({ repoId, fileId }));

    return () => {
      dispatch(clearCurrentFile());
    };
  }, [dispatch, repoId, fileId]);

  if (loading || !currentFile) return <Loader size="lg" text="Loading file..." />;

  if (error) {
    return (
      <div className="glass-card p-12 text-center text-red-400">
        <h2 className="text-xl font-bold mb-2">Error loading file</h2>
        <p>{error}</p>
        <Link to={`/repos/${repoId}`} className="btn-secondary mt-6 inline-block">Back to Repository</Link>
      </div>
    );
  }

  const isOwner = user?._id === currentRepo?.owner?._id;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/repos/${repoId}`} className="p-2 rounded-lg bg-dark-800 text-dark-300 hover:text-dark-100 transition-colors">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-dark-50">{currentFile.path}</h1>
          <div className="text-sm text-dark-400 flex items-center gap-3 mt-1">
            <span>{formatFileSize(currentFile.size)}</span>
            <span>•</span>
            <span>{currentFile.mimeType}</span>
          </div>
        </div>

        {isOwner && (
          <div className="ml-auto flex items-center gap-2">
            <Link to={`/repos/${repoId}/files/${fileId}/edit`} className="btn-secondary flex items-center gap-2 h-9 px-3">
              <FiEdit2 className="w-4 h-4" /> Edit
            </Link>
          </div>
        )}
      </div>

      {currentFile.lastCommit && (
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

      <div className="rounded-lg overflow-hidden shadow-2xl">
        <CodeEditor 
          filename={currentFile.name} 
          content={currentFile.content} 
          readOnly={true} 
        />
      </div>
    </div>
  );
};

export default FileViewPage;
