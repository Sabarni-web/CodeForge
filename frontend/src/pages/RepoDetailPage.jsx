import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRepoById, toggleStar, deleteRepo } from '../features/repos/repoThunks';
import { fetchFileTree, fetchFileContent, createFile, uploadBulkFiles } from '../features/files/fileThunks';
import { clearCurrentRepo } from '../features/repos/repoSlice';
import { forkRepository } from '../features/repos/forkSlice';
import { fetchMembers } from '../features/repos/repositoryCollaboratorSlice';
import FileTree from '../components/file/FileTree';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { FiStar, FiGitCommit, FiDownload, FiTrash2, FiClock, FiFileText, FiUploadCloud, FiSettings, FiGlobe, FiLock, FiActivity, FiUsers, FiEye, FiZap, FiShield, FiGitBranch } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { getLanguageFromFilename } from '../utils/fileHelpers';

const languageColors = {
  javascript: '#f1e05a',
  typescript: '#3178c6',
  html: '#e34c26',
  css: '#563d7c',
  scss: '#c6538c',
  json: '#292929',
  markdown: '#083fa1',
  python: '#3572A5',
  java: '#b07219',
  c: '#555555',
  cpp: '#f34b7d',
  go: '#00ADD8',
  rust: '#dea584',
  ruby: '#701516',
  php: '#4F5D95',
  sql: '#e38c00',
  shell: '#89e051',
  yaml: '#cb171e',
  xml: '#0060ac',
  plaintext: '#9ca3af',
  dockerfile: '#384d54'
};

const RepoDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentRepo, loading: repoLoading, error: repoError } = useSelector((state) => state.repos);
  const { tree, loading: treeLoading } = useSelector((state) => state.files);
  const { user } = useSelector((state) => state.auth);
  const { collaborators } = useSelector((state) => state.repositoryCollaborators);

  const isOwnerOrMaintainer = useMemo(() => {
    if (!currentRepo || !user) return false;
    const ownerId = currentRepo.owner?._id || currentRepo.owner;
    if (user._id === ownerId) return true;
    const collab = collaborators?.find(c => c.user._id === user._id && c.status === 'Accepted');
    return collab && collab.role === 'Maintainer';
  }, [currentRepo, user, collaborators]);

  const [readmeContent, setReadmeContent] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { loading: forkLoading } = useSelector((state) => state.fork);

  const [createFileModalOpen, setCreateFileModalOpen] = useState(false);
  const [newFileFormData, setNewFileFormData] = useState({ path: '', content: '' });
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  const [isUploadingFolder, setIsUploadingFolder] = useState(false);
  const folderInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchRepoById(id));
    dispatch(fetchFileTree(id));
    dispatch(fetchMembers(id));

    return () => {
      dispatch(clearCurrentRepo());
    };
  }, [dispatch, id]);

  useEffect(() => {
    // If we have a tree, try to find a README.md to display
    if (tree && tree.length > 0) {
      const readmeNode = tree.find((node) => node.name.toLowerCase() === 'readme.md' && node.type === 'file');
      
      if (readmeNode) {
        dispatch(fetchFileContent({ repoId: id, fileId: readmeNode._id }))
          .unwrap()
          .then((file) => setReadmeContent(file.content))
          .catch(() => setReadmeContent('Failed to load README.'));
      }
    }
  }, [tree, dispatch, id]);

  const languages = useMemo(() => {
    if (!tree || tree.length === 0) return [];
    
    const stats = {};
    let totalSize = 0;

    const traverse = (nodes) => {
      if (!nodes) return;
      for (const node of nodes) {
        if (node.type === 'file') {
          const lang = getLanguageFromFilename(node.name);
          // Only count recognized languages for the bar
          if (lang !== 'plaintext' || node.name.endsWith('.txt')) {
            stats[lang] = (stats[lang] || 0) + node.size;
            totalSize += node.size;
          }
        } else if (node.type === 'directory' && node.children) {
          traverse(node.children);
        }
      }
    };

    traverse(tree);

    if (totalSize === 0) return [];

    return Object.entries(stats)
      .map(([name, size]) => ({
        name,
        size,
        percentage: ((size / totalSize) * 100).toFixed(1)
      }))
      .sort((a, b) => b.size - a.size);
  }, [tree]);

  const handleToggleStar = async () => {
    try {
      await dispatch(toggleStar(id)).unwrap();
    } catch (err) {
      toast.error('Failed to star repository');
    }
  };

  const handleFork = async () => {
    // Allowed to fork own repository
    const toastId = toast.loading('Forking repository...');
    try {
      const result = await dispatch(forkRepository(id)).unwrap();
      toast.success('Forked successfully!', { id: toastId });
      navigate(`/${result.repository.owner.username}/${result.repository.name}`);
    } catch (err) {
      toast.error(err || 'Failed to fork repository', { id: toastId });
    }
  };

  const handleDeleteRepo = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteRepo(id)).unwrap();
      toast.success('Repository deleted successfully');
      setDeleteModalOpen(false);
      navigate('/repos');
    } catch (err) {
      toast.error('Failed to delete repository');
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    window.open(`${import.meta.env.VITE_API_URL}/repos/${id}/download`, '_blank');
  };

  const handleCreateFile = async (e) => {
    e.preventDefault();
    if (!newFileFormData.path) return toast.error('File path is required');
    
    setIsCreatingFile(true);
    try {
      const name = newFileFormData.path.split('/').pop();
      await dispatch(createFile({ 
        repoId: id, 
        fileData: { 
          name, 
          path: newFileFormData.path, 
          content: newFileFormData.content 
        } 
      })).unwrap();
      
      toast.success('File created successfully');
      setCreateFileModalOpen(false);
      setNewFileFormData({ path: '', content: '' });
      dispatch(fetchFileTree(id));
    } catch (err) {
      toast.error(err || 'Failed to create file');
    } finally {
      setIsCreatingFile(false);
    }
  };

  const handleFolderUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingFolder(true);
    const toastId = toast.loading('Reading files...');

    try {
      const filesToUpload = [];

      // Exclude common unnecessary folders/files to prevent massive payloads
      const excludePatterns = [/node_modules\//, /\.git\//, /\.DS_Store/];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (excludePatterns.some(pattern => pattern.test(file.webkitRelativePath))) {
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          console.warn(`Skipping ${file.name} as it is too large`);
          continue;
        }

        const content = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => resolve('');
          reader.readAsText(file);
        });

        if (content !== '') {
          filesToUpload.push({
            path: file.webkitRelativePath,
            content
          });
        }
      }

      if (filesToUpload.length === 0) {
        toast.dismiss(toastId);
        toast.error('No valid text files found to upload');
        setIsUploadingFolder(false);
        return;
      }

      toast.loading(`Uploading ${filesToUpload.length} files...`, { id: toastId });

      await dispatch(uploadBulkFiles({ repoId: id, files: filesToUpload })).unwrap();
      
      toast.success('Folder uploaded successfully', { id: toastId });
      dispatch(fetchFileTree(id));
      
    } catch (err) {
      toast.error(err || 'Failed to upload folder', { id: toastId });
    } finally {
      setIsUploadingFolder(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    }
  };

  if (repoLoading && !currentRepo) return <Loader size="lg" text="Loading repository..." />;
  
  if (repoError) {
    return (
      <div className="glass-card p-12 text-center text-red-400">
        <h2 className="text-xl font-bold mb-2">Error loading repository</h2>
        <p>{repoError}</p>
        <Link to="/repos" className="btn-secondary mt-6 inline-block">Back to Repositories</Link>
      </div>
    );
  }

  if (!currentRepo) return null;

  const isOwner = user?._id === currentRepo.owner._id;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-dark-700/50 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-400 flex items-center gap-2">
            <span className="text-dark-200 font-normal hover:underline cursor-pointer">
              {currentRepo.owner.username}
            </span>
            <span className="text-dark-400 font-normal">/</span>
            <span>{currentRepo.name}</span>
            <span className="ml-2 badge border border-dark-600 bg-dark-800 text-dark-300 align-middle inline-flex items-center gap-1.5">
              {currentRepo.visibility === 'private' || currentRepo.isPrivate ? (
                <>
                  <FiLock className="w-3.5 h-3.5 text-yellow-500" /> Private
                </>
              ) : (
                <>
                  <FiGlobe className="w-3.5 h-3.5 text-brand-400" /> Public
                </>
              )}
            </span>
          </h1>
          {currentRepo.isFork && currentRepo.forkSourceOwner && (
            <p className="text-xs text-dark-400 mt-2 flex items-center gap-1.5">
              <FiGitBranch className="text-dark-500" />
              forked from{' '}
              <Link to={`/${currentRepo.forkSourceOwner}/${currentRepo.forkSourceRepository}`} className="text-brand-400 hover:underline">
                {currentRepo.forkSourceOwner}/{currentRepo.forkSourceRepository}
              </Link>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleToggleStar} className="btn-secondary flex items-center gap-2 h-9 px-3 text-sm">
            <FiStar className={currentRepo.starred ? 'fill-yellow-400 text-yellow-400' : ''} />
            <span>{currentRepo.starred ? 'Starred' : 'Star'}</span>
            <span className="ml-1 px-1.5 py-0.5 bg-dark-700 rounded-full text-xs">
              {currentRepo.stars?.length || 0}
            </span>
          </button>

          <button 
            onClick={handleFork} 
            disabled={forkLoading}
            className="btn-secondary flex items-center gap-2 h-9 px-3 text-sm"
          >
            <FiActivity />
            <span>Fork</span>
            <span className="ml-1 px-1.5 py-0.5 bg-dark-700 rounded-full text-xs">
              {currentRepo.forkCount || 0}
            </span>
          </button>
          
          <Link to={`/repos/${id}/network`} className="btn-secondary flex items-center gap-2 h-9 px-3 text-sm">
            <FiGitBranch /> Network
          </Link>
          
          <button onClick={handleDownload} className="btn-secondary flex items-center gap-2 h-9 px-3 text-sm">
            <FiDownload /> Code
          </button>



          {isOwnerOrMaintainer && (
            <Link to={`/repos/${id}/settings`} className="btn-secondary flex items-center gap-2 h-9 px-3 text-sm">
              <FiSettings /> Settings
            </Link>
          )}
          
          {isOwner && (
            <button onClick={() => setDeleteModalOpen(true)} className="btn-danger flex items-center gap-2 h-9 px-3 text-sm">
              <FiTrash2 />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content (Left, 3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center bg-dark-800/80 p-3 rounded-t-lg border border-dark-700 border-b-0">
            <div className="flex items-center gap-4 text-sm text-dark-200">
              <Link to={`/repos/${id}/commits`} className="flex items-center gap-1.5 hover:text-brand-400 transition-colors">
                <FiGitCommit className="text-dark-400" />
                <span className="font-semibold">{currentRepo.commitCount || 0}</span> commits
              </Link>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <input 
                  type="file" 
                  webkitdirectory="" 
                  directory="" 
                  multiple="" 
                  className="hidden" 
                  ref={folderInputRef}
                  onChange={handleFolderUpload}
                />
                <button 
                  onClick={() => folderInputRef.current?.click()}
                  disabled={isUploadingFolder}
                  className="text-xs bg-dark-700 hover:bg-dark-600 px-2 py-1 rounded transition-colors text-dark-200 flex items-center gap-1 disabled:opacity-50"
                >
                  <FiUploadCloud /> {isUploadingFolder ? 'Uploading...' : 'Upload folder'}
                </button>
                <button 
                  onClick={() => setCreateFileModalOpen(true)} 
                  className="text-xs bg-dark-700 hover:bg-dark-600 px-2 py-1 rounded transition-colors text-dark-200"
                >
                  Add file
                </button>
              </div>
            )}
          </div>
          
          <div className="-mt-6">
            {treeLoading ? (
              <div className="border border-dark-700 rounded-b-lg p-8 flex justify-center bg-dark-900">
                <Loader size="sm" text="Loading files..." />
              </div>
            ) : (
              <div className="rounded-b-lg overflow-hidden border-t-0">
                 <FileTree tree={tree} repoId={id} />
              </div>
            )}
          </div>

          {/* README Section */}
          {readmeContent && (
            <div className="mt-8 border border-dark-700 rounded-lg overflow-hidden glass-card">
              <div className="bg-dark-800/80 px-4 py-3 border-b border-dark-700 flex items-center gap-2 text-sm font-semibold text-dark-100">
                <FiFileText className="text-dark-400" /> README.md
              </div>
              <div className="p-8 prose prose-invert max-w-none bg-dark-950/50">
                <ReactMarkdown>{readmeContent}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (Right, 1 col) */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-dark-100 mb-2">About</h3>
            <p className="text-dark-300 text-sm mb-4">
              {currentRepo.description || 'No description provided.'}
            </p>
            {currentRepo.website && (
              <a 
                href={currentRepo.website.startsWith('http') ? currentRepo.website : `https://${currentRepo.website}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 text-xs font-semibold hover:underline block mb-4"
              >
                {currentRepo.website}
              </a>
            )}
            
            {/* Topics */}
            {currentRepo.topics?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {currentRepo.topics.map((topic, idx) => (
                  <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 bg-dark-800 rounded-full text-brand-400 border border-dark-700">
                    {topic}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-3 pt-3 border-t border-dark-700/50 text-dark-400 text-xs">
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4 text-dark-500" />
                <span>Created {new Date(currentRepo.createdAt).toLocaleDateString()}</span>
              </div>
              {currentRepo.license && (
                <div className="flex items-center gap-2">
                  <FiShield className="w-4 h-4 text-dark-500" />
                  <span>License: {currentRepo.license}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FiUsers className="w-4 h-4 text-dark-500" />
                <span>Collaborators: {collaborators?.length || 0}</span>
              </div>
            </div>
          </div>
          
          {languages.length > 0 && (
            <div className="pt-4 border-t border-dark-700/50">
              <h3 className="font-semibold text-dark-100 mb-3">Languages</h3>
              <div className="w-full h-2 rounded-full overflow-hidden flex mb-3">
                {languages.map((lang) => (
                  <div 
                    key={lang.name}
                    style={{ 
                      width: `${lang.percentage}%`,
                      backgroundColor: languageColors[lang.name] || '#6e7681'
                    }}
                    title={`${lang.name} ${lang.percentage}%`}
                    className="h-full"
                  />
                ))}
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-dark-200">
                {languages.map((lang) => (
                  <li key={lang.name} className="flex items-center gap-1.5">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: languageColors[lang.name] || '#6e7681' }}
                    />
                    <span className="capitalize">{lang.name}</span>
                    <span className="text-dark-400 font-normal">{lang.percentage}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Delete Repository"
      >
        <div className="space-y-4">
          <p className="text-dark-300 text-sm">
            Are you sure you want to delete <strong className="text-red-400">{currentRepo.name}</strong>? 
            This action <strong className="text-dark-100">cannot be undone</strong>. This will permanently delete the repository, all its files, and commits.
          </p>
          <div className="flex gap-3 justify-end mt-6">
            <button 
              onClick={() => setDeleteModalOpen(false)} 
              disabled={isDeleting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteRepo} 
              disabled={isDeleting}
              className="btn-danger w-24 flex justify-center"
            >
              {isDeleting ? <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create File Modal */}
      <Modal
        isOpen={createFileModalOpen}
        onClose={() => !isCreatingFile && setCreateFileModalOpen(false)}
        title="Create New File"
      >
        <form onSubmit={handleCreateFile} className="space-y-4">
          <div>
            <label className="input-label" htmlFor="filePath">File Path</label>
            <input
              type="text"
              id="filePath"
              className="input-field"
              placeholder="e.g. src/index.js or README.md"
              value={newFileFormData.path}
              onChange={(e) => setNewFileFormData({ ...newFileFormData, path: e.target.value })}
              required
            />
            <p className="text-xs text-dark-400 mt-1">Use forward slashes for folders. E.g. folder/file.txt</p>
          </div>
          <div>
            <label className="input-label" htmlFor="fileContent">Initial Content (Optional)</label>
            <textarea
              id="fileContent"
              className="input-field min-h-[150px] font-mono text-sm resize-none"
              placeholder="Write your code here..."
              value={newFileFormData.content}
              onChange={(e) => setNewFileFormData({ ...newFileFormData, content: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button 
              type="button"
              onClick={() => setCreateFileModalOpen(false)} 
              disabled={isCreatingFile}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isCreatingFile}
              className="btn-primary w-24 flex justify-center"
            >
              {isCreatingFile ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RepoDetailPage;
