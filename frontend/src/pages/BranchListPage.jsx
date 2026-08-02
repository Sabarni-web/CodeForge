import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRepoById } from '../features/repos/repoThunks';
import { fetchBranches, createBranch, renameBranch, deleteBranch, mergeBranch } from '../features/branches/branchThunks';
import { fetchMembers } from '../features/repos/repositoryCollaboratorSlice';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { FiArrowLeft, FiTrash2, FiEdit2, FiGitMerge, FiPlus, FiSearch } from 'react-icons/fi';
import { timeAgo } from '../utils/dateFormatter';
import toast from 'react-hot-toast';

const BranchListPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentRepo, loading: repoLoading } = useSelector((state) => state.repos);
  const { branches, loading: branchLoading } = useSelector((state) => state.branches);
  const { user } = useSelector((state) => state.auth);
  const { collaborators } = useSelector((state) => state.repositoryCollaborators);

  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [branchToRename, setBranchToRename] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [branchToMerge, setBranchToMerge] = useState(null);

  const canEdit = useMemo(() => {
    if (!currentRepo || !user) return false;
    const ownerId = currentRepo.owner?._id || currentRepo.owner;
    if (user._id === ownerId) return true;
    const collab = collaborators?.find(c => (c.user._id || c.user) === user._id && c.status === 'Accepted');
    return collab && ['Maintainer', 'Contributor'].includes(collab.role);
  }, [currentRepo, user, collaborators]);

  useEffect(() => {
    dispatch(fetchRepoById(id));
    dispatch(fetchBranches(id));
    dispatch(fetchMembers(id));
  }, [dispatch, id]);

  const filteredBranches = useMemo(() => {
    if (!searchQuery) return branches;
    return branches.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [branches, searchQuery]);

  const defaultBranch = filteredBranches.find(b => b.name === 'main');
  const activeBranches = filteredBranches.filter(b => b.name !== 'main');

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    try {
      await dispatch(createBranch({ repoId: id, name: newBranchName, sourceBranch: 'main' })).unwrap();
      toast.success(`Branch ${newBranchName} created`);
      setCreateModalOpen(false);
      setNewBranchName('');
    } catch (err) {
      toast.error(err || 'Failed to create branch');
    }
  };

  const handleRenameBranch = async (e) => {
    e.preventDefault();
    if (!renameValue.trim() || !branchToRename) return;
    try {
      await dispatch(renameBranch({ repoId: id, branchName: branchToRename.name, newName: renameValue })).unwrap();
      toast.success(`Branch renamed to ${renameValue}`);
      setRenameModalOpen(false);
      setBranchToRename(null);
      setRenameValue('');
    } catch (err) {
      toast.error(err || 'Failed to rename branch');
    }
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;
    try {
      await dispatch(deleteBranch({ repoId: id, branchName: branchToDelete.name })).unwrap();
      toast.success(`Branch deleted`);
      setDeleteModalOpen(false);
      setBranchToDelete(null);
    } catch (err) {
      toast.error(err || 'Failed to delete branch');
    }
  };

  const handleMergeBranch = async () => {
    if (!branchToMerge) return;
    try {
      await dispatch(mergeBranch({ repoId: id, branchName: branchToMerge.name })).unwrap();
      toast.success(`Merged ${branchToMerge.name} into main`);
      setMergeModalOpen(false);
      setBranchToMerge(null);
    } catch (err) {
      toast.error(err || 'Failed to merge branch');
    }
  };

  if (repoLoading && !currentRepo) return <Loader size="lg" text="Loading repository..." />;
  if (!currentRepo) return null;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to={`/repos/${id}`} className="p-2 rounded-lg bg-dark-800 text-dark-300 hover:text-dark-100 transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-dark-50">Branches</h1>
        </div>
        {canEdit && (
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus /> New branch
          </button>
        )}
      </div>

      <div className="bg-dark-900 border border-dark-700 rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b border-dark-700 bg-dark-950">
          <div className="relative w-full max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input 
              type="text" 
              placeholder="Search branches..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-md py-2 pl-10 pr-4 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Default Branch */}
        {defaultBranch && (
          <div className="p-4">
            <h2 className="text-sm font-semibold text-dark-300 mb-3 uppercase tracking-wider">Default branch</h2>
            <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-md border border-dark-700">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-brand-500/20 text-brand-300 text-xs font-mono rounded">{defaultBranch.name}</span>
                <span className="text-xs text-dark-400">Default</span>
              </div>
              <div className="text-xs text-dark-400">
                {defaultBranch.createdAt ? `Created ${timeAgo(defaultBranch.createdAt)}` : 'System generated'}
              </div>
            </div>
          </div>
        )}

        {/* Active Branches */}
        {activeBranches.length > 0 && (
          <div className="p-4 pt-2">
            <h2 className="text-sm font-semibold text-dark-300 mb-3 uppercase tracking-wider">Active branches</h2>
            <div className="space-y-2">
              {activeBranches.map(branch => (
                <div key={branch._id || branch.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-dark-800/50 rounded-md border border-dark-700 gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-dark-700 text-dark-200 text-xs font-mono rounded">{branch.name}</span>
                    </div>
                    <div className="text-xs text-dark-400">
                      {branch.createdAt ? `Created ${timeAgo(branch.createdAt)}` : ''}
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setBranchToMerge(branch);
                          setMergeModalOpen(true);
                        }}
                        className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 border-brand-500/30 text-brand-300 hover:bg-brand-500/10"
                        title="Merge into main"
                      >
                        <FiGitMerge /> Merge
                      </button>
                      <button 
                        onClick={() => {
                          setBranchToRename(branch);
                          setRenameValue(branch.name);
                          setRenameModalOpen(true);
                        }}
                        className="p-2 rounded bg-dark-700 hover:bg-dark-600 text-dark-300 transition-colors"
                        title="Rename branch"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setBranchToDelete(branch);
                          setDeleteModalOpen(true);
                        }}
                        className="p-2 rounded bg-dark-700 hover:bg-red-500/20 text-dark-300 hover:text-red-400 transition-colors"
                        title="Delete branch"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredBranches.length === 0 && (
          <div className="p-12 text-center text-dark-400">
            No branches found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Branch">
        <form onSubmit={handleCreateBranch}>
          <div className="mb-4">
            <label className="block text-sm text-dark-300 mb-2">Branch Name</label>
            <input 
              type="text" 
              className="input-field"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="e.g., feature/new-login"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={!newBranchName.trim()} className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      {/* Rename Modal */}
      <Modal isOpen={renameModalOpen} onClose={() => setRenameModalOpen(false)} title="Rename Branch">
        <form onSubmit={handleRenameBranch}>
          <div className="mb-4">
            <label className="block text-sm text-dark-300 mb-2">New Branch Name</label>
            <input 
              type="text" 
              className="input-field"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="New name..."
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setRenameModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={!renameValue.trim() || renameValue === branchToRename?.name} className="btn-primary">Rename</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Branch">
        <p className="text-dark-300 mb-6">
          Are you sure you want to delete the branch <strong className="text-red-400 font-mono">{branchToDelete?.name}</strong>? This action cannot be undone and will delete all files exclusive to this branch.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleDeleteBranch} className="btn-danger">Delete</button>
        </div>
      </Modal>

      {/* Merge Modal */}
      <Modal isOpen={mergeModalOpen} onClose={() => setMergeModalOpen(false)} title="Merge Branch">
        <p className="text-dark-300 mb-6">
          Merge <strong className="text-brand-400 font-mono">{branchToMerge?.name}</strong> into <strong className="text-brand-400 font-mono">main</strong>? 
          <br/><br/>
          This will copy all files from this branch into main, creating a new merge commit. (Note: Existing files in main with the same path will be overwritten).
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setMergeModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleMergeBranch} className="btn-primary">Merge into main</button>
        </div>
      </Modal>

    </div>
  );
};

export default BranchListPage;
