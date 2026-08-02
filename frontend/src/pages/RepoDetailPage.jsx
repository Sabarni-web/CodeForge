import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRepoById, toggleStar, deleteRepo } from '../features/repos/repoThunks';
import { fetchFileTree, fetchFileContent, createFile, uploadBulkFiles } from '../features/files/fileThunks';
import { fetchBranches, createBranch } from '../features/branches/branchThunks';
import { setCurrentBranch } from '../features/branches/branchSlice';
import { clearCurrentRepo } from '../features/repos/repoSlice';
import { clearTree } from '../features/files/fileSlice';
import { forkRepository } from '../features/repos/forkSlice';
import { fetchMembers } from '../features/repos/repositoryCollaboratorSlice';
import FileTree from '../components/file/FileTree';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { FiStar, FiGitCommit, FiDownload, FiTrash2, FiClock, FiFileText, FiUploadCloud, FiSettings, FiGlobe, FiLock, FiActivity, FiUsers, FiEye, FiZap, FiShield, FiGitBranch, FiEdit2, FiList, FiSearch, FiCheck, FiTerminal, FiCopy, FiBox, FiCheckCircle } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { getLanguageFromFilename } from '../utils/fileHelpers';
import { FiRefreshCw } from 'react-icons/fi';
import SyncRepositoryModal from '../components/sync/SyncRepositoryModal';
import { clearSyncState } from '../features/sync/syncSlice';
import GuardianStatusCard from '../components/guardian/GuardianStatusCard';

import { compareSync as compareSyncThunk } from '../features/sync/syncThunks';

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
  const { branches, currentBranch } = useSelector((state) => state.branches);

  const isOwnerOrMaintainer = useMemo(() => {
    if (!currentRepo || !user) return false;
    const ownerId = currentRepo.owner?._id || currentRepo.owner;
    if (user._id === ownerId) return true;
    const collab = collaborators?.find(c => c.user._id === user._id && c.status === 'Accepted');
    return collab && collab.role === 'Maintainer';
  }, [currentRepo, user, collaborators]);

  const canEdit = useMemo(() => {
    if (!currentRepo || !user) return false;
    const ownerId = currentRepo.owner?._id || currentRepo.owner;
    if (user._id === ownerId) return true;
    const collab = collaborators?.find(c => (c.user._id || c.user) === user._id && c.status === 'Accepted');
    return collab && ['Maintainer', 'Contributor'].includes(collab.role);
  }, [currentRepo, user, collaborators]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createFileModalOpen, setCreateFileModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [readmeContent, setReadmeContent] = useState('');
  const [readmeFileId, setReadmeFileId] = useState(null);
  const [newFileFormData, setNewFileFormData] = useState({ path: '', content: '' });
  const [isUploadingFolder, setIsUploadingFolder] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  
  // New UI states
  const [goToFileModalOpen, setGoToFileModalOpen] = useState(false);
  const [goToFileSearchQuery, setGoToFileSearchQuery] = useState('');
  const [watchDropdownOpen, setWatchDropdownOpen] = useState(false);
  const [watchOption, setWatchOption] = useState('Participating and @mentions');
  const [customWatchModalOpen, setCustomWatchModalOpen] = useState(false);
  const [customWatchEvents, setCustomWatchEvents] = useState({
    issues: false,
    pullRequests: false,
    releases: false,
    discussions: false,
    securityAlerts: false
  });
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);
  const [codeTab, setCodeTab] = useState('Local');
  const [cloneTab, setCloneTab] = useState('HTTPS');
  const [copiedCloneUrl, setCopiedCloneUrl] = useState(false);
  
  const { loading: forkLoading } = useSelector((state) => state.fork);

  const folderInputRef = useRef(null);

  // Sync Logic
  const syncInputRef = useRef(null);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [localFilesContent, setLocalFilesContent] = useState({});
  const { diff, isComparing } = useSelector((state) => state.sync);

  useEffect(() => {
    dispatch(fetchRepoById(id));
    dispatch(fetchBranches(id));
    dispatch(fetchMembers(id));

    return () => {
      dispatch(clearCurrentRepo());
      dispatch(clearTree());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentBranch) {
      dispatch(fetchFileTree({ repoId: id, branch: currentBranch }));
    }
  }, [dispatch, id, currentBranch]);

  useEffect(() => {
    // If we have a tree, try to find a README.md to display
    if (tree && tree.length > 0) {
      const readmeNode = tree.find((node) => node.name.toLowerCase() === 'readme.md' && node.type === 'file');
      
      if (readmeNode) {
        setReadmeFileId(readmeNode._id);
        dispatch(fetchFileContent({ repoId: id, fileId: readmeNode._id, branch: currentBranch }))
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
        branch: currentBranch,
        fileData: { 
          name, 
          path: newFileFormData.path, 
          content: newFileFormData.content 
        } 
      })).unwrap();
      
      toast.success('File created successfully');
      setCreateFileModalOpen(false);
      setNewFileFormData({ path: '', content: '' });
      dispatch(fetchFileTree({ repoId: id, branch: currentBranch }));
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
          // Extract path by removing the top-level directory name
          // e.g. "my-project/src/index.js" -> "src/index.js"
          const pathParts = file.webkitRelativePath.split('/');
          const relativePath = pathParts.length > 1 ? pathParts.slice(1).join('/') : file.name;
          
          filesToUpload.push({
            path: relativePath,
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

      await dispatch(uploadBulkFiles({ repoId: id, files: filesToUpload, branch: currentBranch })).unwrap();
      
      toast.success('Folder uploaded successfully', { id: toastId });
      dispatch(fetchFileTree({ repoId: id, branch: currentBranch }));
      
    } catch (err) {
      toast.error(err || 'Failed to upload folder', { id: toastId });
    } finally {
      setIsUploadingFolder(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    }
  };

  const handleSyncClick = () => {
    syncInputRef.current?.click();
  };

  const generateHash = async (arrayBuffer) => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSyncFolderSelection = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const toastId = toast.loading('Analyzing local folder...');
    try {
      const localFiles = [];
      const contentMap = {};
      const excludePatterns = [
        /node_modules\//, /\.git\//, /\.vscode\//, /\.idea\//, 
        /dist\//, /build\//, /coverage\//, /\.next\//, /\.cache\//, 
        /temp\//, /logs\//, /(^|\/)\.[^\/]+$/, /Thumbs\.db$/, 
        /Desktop\.ini$/, /\.DS_Store$/, /\.env\.local$/, 
        /npm-debug\.log$/, /yarn\.lock$/, /package-lock\.json$/
      ];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (excludePatterns.some(pattern => pattern.test(file.webkitRelativePath))) continue;
        if (file.size > 5 * 1024 * 1024) continue; // Skip files > 5MB for simplicity

        try {
          const arrayBuffer = await file.arrayBuffer();
          const hash = await generateHash(arrayBuffer);
          
          // Also need text content for payload
          const textContent = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve('');
            reader.readAsText(file);
          });

          if (textContent !== '') {
            localFiles.push({
              path: file.webkitRelativePath,
              hash,
              size: file.size,
              lastModified: file.lastModified
            });
            contentMap[file.webkitRelativePath] = textContent;
          }
        } catch (e) {
          console.error("Failed to read file:", file.webkitRelativePath, e);
        }
      }

      setLocalFilesContent(contentMap);
      toast.loading('Comparing with repository...', { id: toastId });
      
      await dispatch(compareSyncThunk({ repoId: id, localFiles })).unwrap();
      
      toast.dismiss(toastId);
      setSyncModalOpen(true);
    } catch (err) {
      toast.error(err || 'Failed to analyze folder', { id: toastId });
    } finally {
      if (syncInputRef.current) {
        syncInputRef.current.value = '';
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

  const getWatchButtonText = () => {
    if (watchOption === 'All Activity') return 'Unwatch';
    if (watchOption === 'Ignore') return 'Stop ignoring';
    if (watchOption === 'Custom') return 'Unwatch';
    return 'Watch';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-700/50 pb-4 bg-dark-900 px-4 pt-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          {/* Avatar Placeholder */}
          <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center overflow-hidden">
             {currentRepo.owner.avatar ? (
               <img src={currentRepo.owner.avatar} alt="avatar" className="w-full h-full object-cover" />
             ) : (
               <FiUsers className="w-3 h-3 text-dark-400" />
             )}
          </div>
          <h1 className="text-xl font-normal text-brand-400 flex items-center gap-1">
            <span className="hover:underline cursor-pointer">
              {currentRepo.owner.username}
            </span>
            <span className="text-dark-500">/</span>
            <span className="font-semibold hover:underline cursor-pointer">{currentRepo.name}</span>
            <span className="ml-2 px-2 py-0.5 border border-dark-700/50 rounded-full text-[12px] font-medium text-dark-400 flex items-center gap-1">
              {currentRepo.visibility === 'private' || currentRepo.isPrivate ? 'Private' : 'Public'}
            </span>
            {currentRepo.guardianEnabled && (
              <span className="ml-2 badge border border-emerald-500/30 bg-emerald-900/20 text-emerald-400 align-middle inline-flex items-center gap-1.5" title="CodeForge Guardian Protected">
                <FiShield className="w-3.5 h-3.5" /> Protected
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-md shadow-sm">
            <button onClick={handleToggleStar} className="px-3 py-1 text-xs font-medium text-dark-200 bg-dark-800 border border-dark-600 rounded-l-md hover:bg-dark-700 flex items-center gap-1.5 transition-colors">
              <FiStar className={currentRepo.starred ? 'fill-yellow-400 text-yellow-400' : 'text-dark-400'} />
              <span>{currentRepo.starred ? 'Starred' : 'Star'}</span>
            </button>
            <div className="px-3 py-1 text-xs font-medium text-dark-200 bg-dark-900 border border-l-0 border-dark-600 rounded-r-md flex items-center justify-center min-w-[32px]">
              {currentRepo.stars?.length || 0}
            </div>
          </div>

          <div className="flex rounded-md shadow-sm">
            <button onClick={handleFork} disabled={forkLoading} className="px-3 py-1 text-xs font-medium text-dark-200 bg-dark-800 border border-dark-600 rounded-l-md hover:bg-dark-700 flex items-center gap-1.5 transition-colors disabled:opacity-50">
              <FiGitBranch className="text-dark-400" />
              <span>Fork</span>
            </button>
            <div className="px-3 py-1 text-xs font-medium text-dark-200 bg-dark-900 border border-l-0 border-dark-600 rounded-r-md flex items-center justify-center min-w-[32px]">
              {currentRepo.forkCount || 0}
            </div>
          </div>

          {currentRepo.guardianEnabled && (
            <Link to="/guardian/verify" state={{ targetRepoId: currentRepo._id }} className="btn-primary bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2 h-9 px-3 text-sm">
              <FiShield /> Verify Code
            </Link>
          )}

          <div className="relative">
            <button onClick={() => setWatchDropdownOpen(!watchDropdownOpen)} className="px-3 py-1 text-xs font-medium text-dark-200 bg-dark-800 border border-dark-600 rounded-md hover:bg-dark-700 flex items-center gap-1.5 transition-colors">
              <FiEye className="text-dark-400" />
              <span>{getWatchButtonText()}</span>
              <span className="ml-1 bg-dark-700 text-dark-200 px-1.5 rounded-full text-[10px]">0</span>
              <span className="ml-1 text-[10px]">▼</span>
            </button>
            {watchDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-dark-900 border border-dark-600 rounded-md shadow-lg z-50 py-2">
                
                <div 
                  className="px-4 py-2 hover:bg-dark-800 cursor-pointer flex items-start gap-3"
                  onClick={() => { setWatchOption('Participating and @mentions'); setWatchDropdownOpen(false); }}
                >
                  <div className="mt-0.5">{watchOption === 'Participating and @mentions' ? <FiCheck className="text-brand-400 w-4 h-4" /> : <div className="w-4 h-4" />}</div>
                  <div>
                    <div className="text-sm font-semibold text-dark-100">Participating and @mentions</div>
                    <div className="text-xs text-dark-400 mt-0.5">Only receive notifications from this repository when participating or @mentioned.</div>
                  </div>
                </div>
>>>>>>> 17068516cbbe9cce55222f209b5c97aa5c0a12ab

                <div 
                  className="px-4 py-2 hover:bg-dark-800 cursor-pointer flex items-start gap-3"
                  onClick={() => { setWatchOption('All Activity'); setWatchDropdownOpen(false); }}
                >
                  <div className="mt-0.5">{watchOption === 'All Activity' ? <FiCheck className="text-brand-400 w-4 h-4" /> : <div className="w-4 h-4" />}</div>
                  <div>
                    <div className="text-sm font-semibold text-dark-100">All Activity</div>
                    <div className="text-xs text-dark-400 mt-0.5">Notified of all notifications on this repository.</div>
                  </div>
                </div>

                <div 
                  className="px-4 py-2 hover:bg-dark-800 cursor-pointer flex items-start gap-3"
                  onClick={() => { setWatchOption('Ignore'); setWatchDropdownOpen(false); }}
                >
                  <div className="mt-0.5">{watchOption === 'Ignore' ? <FiCheck className="text-brand-400 w-4 h-4" /> : <div className="w-4 h-4" />}</div>
                  <div>
                    <div className="text-sm font-semibold text-dark-100">Ignore</div>
                    <div className="text-xs text-dark-400 mt-0.5">Never be notified.</div>
                  </div>
                </div>

                <div 
                  className="px-4 py-2 hover:bg-dark-800 cursor-pointer flex items-start gap-3 border-t border-dark-700/50 mt-1 pt-3"
                  onClick={() => { 
                    setWatchDropdownOpen(false); 
                    setCustomWatchModalOpen(true);
                  }}
                >
                  <div className="mt-0.5">{watchOption === 'Custom' ? <FiCheck className="text-brand-400 w-4 h-4" /> : <div className="w-4 h-4" />}</div>
                  <div className="w-full flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-dark-100">Custom</div>
                      <div className="text-xs text-dark-400 mt-0.5">Select events you want to be notified of in addition to participating and @mentions.</div>
                    </div>
                    <span className="text-dark-400 text-lg">→</span>
                  </div>
                </div>

              </div>
            )}
          </div>

          {isOwnerOrMaintainer && (
            <Link to={`/repos/${id}/settings`} className="px-3 py-1 text-xs font-medium text-dark-200 bg-dark-800 border border-dark-600 rounded-md hover:bg-dark-700 flex items-center gap-1.5 transition-colors">
              <FiSettings className="text-dark-400" /> Settings
            </Link>
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
                  <FiUploadCloud /> {isUploadingFolder ? 'Uploading...' : 'Upload Files'}
                </button>
                <input 
                  type="file" 
                  webkitdirectory="" 
                  directory="" 
                  className="hidden" 
                  ref={syncInputRef}
                  onChange={handleSyncFolderSelection}
                />
                <button 
                  onClick={handleSyncClick}
                  disabled={isComparing}
                  className="text-xs bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 px-3 py-1 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {isComparing ? <div className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /> : <FiRefreshCw />}
                  Sync Changes
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
          
          {/* Action Bar (Branch, Go to file, Code) */}
          <div className="flex justify-between items-center bg-dark-900 px-4 py-2 border border-dark-700/50 rounded-md">
            <div className="flex items-center gap-4 text-sm text-dark-200">
              <div className="relative">
                <button 
                  onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 border border-dark-600 rounded hover:bg-dark-700 font-medium"
                >
                  <FiGitBranch className="text-dark-400" /> {currentBranch} <span className="ml-1 text-[10px]">▼</span>
                </button>
                
                {branchDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-dark-900 border border-dark-600 rounded-md shadow-lg z-50 py-2">
                    <div className="px-3 pb-2 border-b border-dark-700/50">
                      <span className="text-xs font-semibold text-dark-100">Switch branches</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {branches.map(b => (
                        <div 
                          key={b._id} 
                          className="px-4 py-2 hover:bg-dark-800 cursor-pointer flex items-center gap-2 text-sm text-dark-200"
                          onClick={() => {
                            dispatch(setCurrentBranch(b.name));
                            setBranchDropdownOpen(false);
                          }}
                        >
                          {currentBranch === b.name ? <FiCheck className="text-brand-400" /> : <div className="w-4" />}
                          {b.name}
                        </div>
                      ))}
                    </div>
                    {canEdit && (
                      <form 
                        className="px-3 pt-2 border-t border-dark-700/50 mt-1"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!newBranchName.trim()) return;
                          try {
                            await dispatch(createBranch({ repoId: id, name: newBranchName, sourceBranch: currentBranch })).unwrap();
                            setNewBranchName('');
                            setBranchDropdownOpen(false);
                            toast.success(`Branch ${newBranchName} created`);
                          } catch (err) {
                            toast.error(err);
                          }
                        }}
                      >
                        <input 
                          type="text" 
                          value={newBranchName}
                          onChange={(e) => setNewBranchName(e.target.value)}
                          placeholder="Find or create a branch..."
                          className="w-full bg-dark-800 border border-dark-600 rounded px-2 py-1 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
                        />
                        <button type="submit" className="mt-2 w-full btn-primary py-1 text-xs">Create Branch</button>
                      </form>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Link to={`/repos/${id}/branches`} className="flex items-center gap-1 hover:text-brand-400 cursor-pointer">
                  <FiGitBranch className="text-dark-500" /> {branches.length} Branch{branches.length !== 1 ? 'es' : ''}
                </Link>
                <span className="flex items-center gap-1 hover:text-brand-400 cursor-pointer"><FiStar className="text-dark-500" /> 0 Tags</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setGoToFileModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 border border-dark-600 rounded hover:bg-dark-700 text-sm font-medium text-dark-200 transition-colors"
              >
                <FiSearch className="text-dark-500 w-4 h-4" /> Go to file
              </button>
              
              {canEdit && (
                <>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 border border-dark-600 rounded hover:bg-dark-700 text-sm font-medium text-dark-200 transition-colors"
                  >
                    <FiUploadCloud className="text-dark-400" /> Upload Files
                  </button>
                  
                  <button 
                    onClick={() => setCreateFileModalOpen(true)} 
                    className="px-3 py-1.5 text-sm font-medium text-dark-200 bg-dark-800 border border-dark-600 rounded hover:bg-dark-700 transition-colors"
                  >
                    Add file
                  </button>
                </>
              )}
              
              <div className="relative">
                <button onClick={() => setCodeDropdownOpen(!codeDropdownOpen)} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white font-medium text-sm rounded hover:bg-brand-700">
                  {"<>"} Code <span className="ml-1 text-[10px]">▼</span>
                </button>
                  {codeDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-dark-900 border border-dark-600 rounded-md shadow-lg z-50 overflow-hidden">
                      <div className="flex border-b border-dark-700/50">
                        <button 
                          className={`flex-1 py-2 text-sm font-semibold transition-colors ${codeTab === 'Local' ? 'border-b-2 border-brand-500 text-dark-100' : 'text-dark-400 hover:text-dark-200'}`}
                          onClick={() => setCodeTab('Local')}
                        >
                          Local
                        </button>
                        <button 
                          className={`flex-1 py-2 text-sm font-semibold transition-colors ${codeTab === 'Cloud' ? 'border-b-2 border-brand-500 text-dark-100' : 'text-dark-400 hover:text-dark-200'}`}
                          onClick={() => setCodeTab('Cloud')}
                        >
                          Cloud Workspaces
                        </button>
                      </div>

                      {codeTab === 'Local' ? (
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FiTerminal className="text-dark-400" />
                            <span className="text-sm font-semibold text-dark-100">Clone</span>
                          </div>
                          
                          <div className="flex border border-dark-600 rounded-md overflow-hidden mb-2">
                            <button className={`flex-1 py-1.5 text-xs font-semibold ${cloneTab === 'HTTPS' ? 'bg-dark-700 text-dark-100' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`} onClick={() => setCloneTab('HTTPS')}>HTTPS</button>
                            <button className={`flex-1 py-1.5 text-xs font-semibold border-l border-r border-dark-600 ${cloneTab === 'SSH' ? 'bg-dark-700 text-dark-100' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`} onClick={() => setCloneTab('SSH')}>SSH</button>
                            <button className={`flex-1 py-1.5 text-xs font-semibold ${cloneTab === 'CLI' ? 'bg-dark-700 text-dark-100' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`} onClick={() => setCloneTab('CLI')}>CodeForge CLI</button>
                          </div>
                          
                          <div className="flex items-center border border-dark-600 rounded-md mb-2 overflow-hidden">
                            <input 
                              type="text" 
                              readOnly 
                              value={`https://codeforge.com/${currentRepo.owner.username}/${currentRepo.name}.git`} 
                              className="w-full bg-dark-900 text-xs text-dark-200 px-2 py-1.5 focus:outline-none"
                            />
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`https://codeforge.com/${currentRepo.owner.username}/${currentRepo.name}.git`);
                                setCopiedCloneUrl(true);
                                setTimeout(() => setCopiedCloneUrl(false), 2000);
                              }}
                              className="p-1.5 bg-dark-800 hover:bg-dark-700 text-dark-400 border-l border-dark-600 transition-colors"
                            >
                              {copiedCloneUrl ? <FiCheckCircle className="text-brand-400 w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-dark-400 mb-4">Clone using the web URL.</p>

                          <div className="space-y-1 pt-3 border-t border-dark-700/50">
                            <button className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-dark-800 rounded text-sm text-dark-200 font-semibold transition-colors">
                              <FiBox className="text-dark-400" /> Open with CodeForge Desktop
                            </button>
                            <button onClick={handleDownload} className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-dark-800 rounded text-sm text-dark-200 font-semibold transition-colors">
                              <FiDownload className="text-dark-400" /> Download ZIP
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-dark-400 text-sm">
                          Cloud Workspaces are not available for this repository yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
          </div>

          <div className="border border-dark-700/50 rounded-md bg-dark-900">
            <div className="flex justify-between items-center bg-dark-800 p-3 border-b border-dark-700/50 rounded-t-md">
              <div className="flex items-center gap-3 text-sm text-dark-200">
                 {currentRepo.owner.avatar ? (
                   <img src={currentRepo.owner.avatar} alt="avatar" className="w-5 h-5 rounded-full object-cover" />
                 ) : (
                   <div className="w-5 h-5 rounded-full bg-dark-700 flex items-center justify-center"><FiUsers className="w-3 h-3 text-dark-400" /></div>
                 )}
                <span className="font-semibold">{currentRepo.owner.username}</span>
                <span className="text-dark-400 hover:text-brand-400 cursor-pointer">Initial commit</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-dark-400">
                <span className="font-mono text-xs">8039685</span>
                <span>4 months ago</span>
                <Link to={`/repos/${id}/commits`} className="flex items-center gap-1.5 hover:text-brand-400 transition-colors font-semibold text-dark-200">
                  <FiGitCommit className="text-dark-500" />
                  <span>{currentRepo.commitCount || 0}</span> <span className="text-dark-400 font-normal">Commits</span>
                </Link>
              </div>
            </div>
            
            <div>
              {treeLoading ? (
                <div className="p-8 flex justify-center bg-dark-900">
                  <Loader size="sm" text="Loading files..." />
                </div>
              ) : (
                <div className="overflow-hidden">
                   <FileTree tree={tree} repoId={id} />
                </div>
              )}
            </div>
          </div>

          {/* README Section */}
          {readmeFileId && (
            <div className="mt-8 border border-dark-700/50 rounded-lg overflow-hidden bg-dark-900 shadow-sm">
              <div className="px-4 py-3 border-b border-dark-700/50 flex items-center justify-between text-sm font-semibold bg-dark-900">
                <div className="flex items-center">
                  <div className="px-2 py-1 border-b-2 border-brand-500 text-dark-100 uppercase tracking-wide text-xs font-bold">
                    README
                  </div>
                </div>
                <div className="flex items-center gap-3 text-dark-400">
                  {isOwnerOrMaintainer && (
                    <Link to={`/repos/${id}/files/${readmeFileId}`} className="hover:text-brand-500 transition-colors" title="Edit README">
                      <FiEdit2 className="w-4 h-4" />
                    </Link>
                  )}
                  <button className="hover:text-brand-500 transition-colors" title="Table of Contents">
                    <FiList className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-8 prose prose-invert max-w-none bg-dark-900 text-dark-100">
                {readmeContent ? (
                  <ReactMarkdown>{readmeContent}</ReactMarkdown>
                ) : (
                  <div className="text-dark-400 italic">README is empty or loading...</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (Right, 1 col) */}
        <div className="space-y-6 lg:pl-4">
          <GuardianStatusCard repoId={id} />
          
          <div className="border-b border-dark-700/50 pb-6">
            <h3 className="font-semibold text-dark-100 mb-3 text-sm">About</h3>
            <p className="text-dark-300 text-sm mb-4">
              {currentRepo.description || 'No description, website, or topics provided.'}
            </p>
            {currentRepo.website && (
              <a 
                href={currentRepo.website.startsWith('http') ? currentRepo.website : `https://${currentRepo.website}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 text-sm font-semibold hover:underline block mb-4"
              >
                {currentRepo.website}
              </a>
            )}
            
            {/* Topics */}
            {currentRepo.topics?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {currentRepo.topics.map((topic, idx) => (
                  <span key={idx} className="text-xs font-semibold px-2 py-0.5 bg-dark-800 text-brand-400 rounded-full hover:bg-dark-700 cursor-pointer">
                    {topic}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-3 text-dark-300 text-sm">
              <div className="flex items-center gap-2 hover:text-brand-400 cursor-pointer">
                <FiFileText className="w-4 h-4 text-dark-500" />
                <span>Readme</span>
              </div>
              <div className="flex items-center gap-2 hover:text-brand-400 cursor-pointer">
                <FiActivity className="w-4 h-4 text-dark-500" />
                <span>Activity</span>
              </div>
              <div className="flex items-center gap-2 hover:text-brand-400 cursor-pointer">
                <FiStar className="w-4 h-4 text-dark-500" />
                <span><span className="font-semibold text-dark-100">{currentRepo.stars?.length || 0}</span> stars</span>
              </div>
              <div className="flex items-center gap-2 hover:text-brand-400 cursor-pointer">
                <FiEye className="w-4 h-4 text-dark-500" />
                <span><span className="font-semibold text-dark-100">0</span> watching</span>
              </div>
              <div className="flex items-center gap-2 hover:text-brand-400 cursor-pointer">
                <FiGitBranch className="w-4 h-4 text-dark-500" />
                <span><span className="font-semibold text-dark-100">{currentRepo.forkCount || 0}</span> forks</span>
              </div>
              
              <div className="flex items-center gap-2 hover:text-brand-400 cursor-pointer mt-4">
                <span className="text-dark-400">Report repository</span>
              </div>
            </div>
          </div>

          <div className="border-b border-dark-700/50 pb-6">
            <h3 className="font-semibold text-dark-100 mb-2 text-sm flex items-center justify-between hover:text-brand-400 cursor-pointer">
              Releases <span className="bg-dark-700 text-dark-200 text-xs px-2 rounded-full">0</span>
            </h3>
            <p className="text-dark-400 text-sm">No releases published</p>
            <span className="text-brand-400 text-sm hover:underline cursor-pointer">Create a new release</span>
          </div>

          <div className="border-b border-dark-700/50 pb-6">
            <h3 className="font-semibold text-dark-100 mb-2 text-sm flex items-center justify-between hover:text-brand-400 cursor-pointer">
              Packages <span className="bg-dark-700 text-dark-200 text-xs px-2 rounded-full">0</span>
            </h3>
            <p className="text-dark-400 text-sm">No packages published</p>
            <span className="text-brand-400 text-sm hover:underline cursor-pointer">Publish your first package</span>
          </div>

          <div className="border-b border-dark-700/50 pb-6">
            <h3 className="font-semibold text-dark-100 mb-4 text-sm flex items-center hover:text-brand-400 cursor-pointer">
              Contributors <span className="bg-dark-700 text-dark-200 text-xs px-2 rounded-full ml-2">{collaborators?.length || 1}</span>
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
               {/* Owner */}
               <div className="flex items-center gap-2 w-full hover:text-brand-400 cursor-pointer">
                 {currentRepo.owner.avatar ? (
                   <img src={currentRepo.owner.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                 ) : (
                   <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center"><FiUsers className="w-4 h-4 text-dark-400" /></div>
                 )}
                 <span className="text-sm font-semibold text-dark-100">{currentRepo.owner.username}</span>
               </div>
               
               {/* Collaborators */}
               {collaborators?.filter(c => c.status === 'Accepted').map((collab) => (
                 <div key={collab.user._id} className="flex items-center gap-2 w-full mt-2 hover:text-brand-400 cursor-pointer">
                   {collab.user.avatar ? (
                     <img src={collab.user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                   ) : (
                     <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center"><FiUsers className="w-4 h-4 text-dark-400" /></div>
                   )}
                   <span className="text-sm font-semibold text-dark-100">{collab.user.username}</span>
                 </div>
               ))}
            </div>
          </div>
          
          {languages.length > 0 && (
            <div>
              <h3 className="font-semibold text-dark-100 mb-3 text-sm hover:text-brand-400 cursor-pointer">Languages</h3>
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
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-dark-100">
                {languages.map((lang) => (
                  <li key={lang.name} className="flex items-center gap-1.5">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: languageColors[lang.name] || '#6e7681' }}
                    />
                    <span className="capitalize hover:text-brand-400 cursor-pointer">{lang.name}</span>
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

      {/* Go To File Modal */}
      <Modal
        isOpen={goToFileModalOpen}
        onClose={() => {
          setGoToFileModalOpen(false);
          setGoToFileSearchQuery('');
        }}
        title=""
      >
        <div className="flex flex-col h-[60vh]">
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-3 text-dark-400 w-5 h-5" />
            <input
              type="text"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg py-2.5 pl-10 pr-4 text-dark-100 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder-dark-500"
              placeholder="Search files..."
              value={goToFileSearchQuery}
              onChange={(e) => setGoToFileSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {tree && (() => {
              let allFiles = [];
              const extractFiles = (nodes, currentPath = '') => {
                if (!nodes) return;
                for (const node of nodes) {
                  const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;
                  if (node.type === 'file') {
                    allFiles.push({ ...node, fullPath: nodePath });
                  } else if (node.type === 'directory' && node.children) {
                    extractFiles(node.children, nodePath);
                  }
                }
              };
              extractFiles(tree);
              
              const lowerQuery = goToFileSearchQuery.toLowerCase();
              const filteredFiles = lowerQuery ? allFiles.filter(f => f.fullPath.toLowerCase().includes(lowerQuery)) : allFiles;

              if (filteredFiles.length === 0) {
                return <div className="text-center text-dark-400 py-8">No files found matching "{goToFileSearchQuery}"</div>;
              }

              return filteredFiles.map(file => (
                <Link 
                  key={file._id} 
                  to={`/repos/${id}/files/${file._id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-brand-500/10 hover:text-brand-400 group transition-colors text-dark-200"
                >
                  <FiFileText className="w-4 h-4 text-dark-500 group-hover:text-brand-400 flex-shrink-0" />
                  <span className="truncate flex-1 font-mono text-sm">{file.fullPath}</span>
                </Link>
              ));
            })()}
          </div>
        </div>
      </Modal>

      {/* Custom Watch Modal */}
      <Modal
        isOpen={customWatchModalOpen}
        onClose={() => setCustomWatchModalOpen(false)}
        title={`Subscribe to events for ${currentRepo.owner.username}/${currentRepo.name}`}
      >
        <div className="space-y-4">
          <div className="border border-dark-600 rounded-md overflow-hidden">
            
            <label className="flex items-center gap-3 p-4 hover:bg-dark-800 border-b border-dark-600 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-dark-600 bg-dark-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-dark-900" 
                checked={customWatchEvents.issues}
                onChange={(e) => setCustomWatchEvents({...customWatchEvents, issues: e.target.checked})}
              />
              <span className="text-sm font-medium text-dark-100">Issues</span>
            </label>

            <label className="flex items-center gap-3 p-4 hover:bg-dark-800 border-b border-dark-600 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-dark-600 bg-dark-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-dark-900" 
                checked={customWatchEvents.pullRequests}
                onChange={(e) => setCustomWatchEvents({...customWatchEvents, pullRequests: e.target.checked})}
              />
              <span className="text-sm font-medium text-dark-100">Pull requests</span>
            </label>

            <label className="flex items-center gap-3 p-4 hover:bg-dark-800 border-b border-dark-600 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-dark-600 bg-dark-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-dark-900" 
                checked={customWatchEvents.releases}
                onChange={(e) => setCustomWatchEvents({...customWatchEvents, releases: e.target.checked})}
              />
              <span className="text-sm font-medium text-dark-100">Releases</span>
            </label>

            <label className="flex items-start gap-3 p-4 hover:bg-dark-800 border-b border-dark-600 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-dark-600 bg-dark-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-dark-900 mt-1" 
                checked={customWatchEvents.discussions}
                onChange={(e) => setCustomWatchEvents({...customWatchEvents, discussions: e.target.checked})}
              />
              <div>
                <div className="text-sm font-medium text-dark-100">Discussions</div>
                <div className="text-xs text-dark-400">Discussions are not enabled for this repository</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 hover:bg-dark-800 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-dark-600 bg-dark-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-dark-900" 
                checked={customWatchEvents.securityAlerts}
                onChange={(e) => setCustomWatchEvents({...customWatchEvents, securityAlerts: e.target.checked})}
              />
              <span className="text-sm font-medium text-dark-100">Security alerts</span>
            </label>

          </div>
          
          <div className="flex gap-3 justify-end mt-4">
            <button 
              type="button"
              onClick={() => setCustomWatchModalOpen(false)} 
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={() => {
                setWatchOption('Custom');
                setCustomWatchModalOpen(false);
              }}
              className="px-4 py-2 bg-[#2ea043] hover:bg-[#2c974b] text-white text-sm font-semibold rounded-md transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>
      <SyncRepositoryModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        repoId={id}
        diff={diff}
        localFilesContent={localFilesContent}
      />
    </div>
  );
};

export default RepoDetailPage;
