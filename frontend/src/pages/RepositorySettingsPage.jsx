import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRepoById, deleteRepo } from '../features/repos/repoThunks';
import {
  updateRepositorySettings,
  updateRepositoryVisibility,
  archiveRepository,
  unarchiveRepository,
  resetSettingsState
} from '../features/repos/repositorySettingsSlice';
import {
  fetchMembers,
  inviteUser,
  removeCollaborator,
  transferOwnership,
  resetCollaboratorState
} from '../features/repos/repositoryCollaboratorSlice';
import { setPermissions } from '../features/repos/repositoryPermissionSlice';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { 
  FiSettings, FiShield, FiUsers, FiAlertTriangle, FiTrash2, 
  FiLock, FiUnlock, FiUserPlus, FiUserMinus, FiGlobe, 
  FiCheck, FiX, FiInfo, FiCheckSquare 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import GuardianSettings from '../components/guardian/GuardianSettings';

const RepositorySettingsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentRepo, loading: repoLoading } = useSelector((state) => state.repos);
  const { user } = useSelector((state) => state.auth);
  
  const { 
    loading: settingsLoading, 
    error: settingsError, 
    success: settingsSuccess 
  } = useSelector((state) => state.repositorySettings);

  const { 
    owner, 
    collaborators, 
    loading: collabLoading, 
    error: collabError, 
    success: collabSuccess 
  } = useSelector((state) => state.repositoryCollaborators);

  const { isOwner, isMaintainer } = useSelector((state) => state.repositoryPermissions);

  const [activeTab, setActiveTab] = useState('general');

  // Form states
  const [generalForm, setGeneralForm] = useState({
    name: '',
    description: '',
    website: '',
    topics: '',
    license: '',
    defaultBranch: '',
  });

  const [inviteForm, setInviteForm] = useState({ username: '', role: 'Contributor' });
  const [transferUsername, setTransferUsername] = useState('');

  // Modals
  const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchRepoById(id));
    dispatch(fetchMembers(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentRepo) {
      setGeneralForm({
        name: currentRepo.name || '',
        description: currentRepo.description || '',
        website: currentRepo.website || '',
        topics: currentRepo.topics ? currentRepo.topics.join(', ') : '',
        license: currentRepo.license || '',
        defaultBranch: currentRepo.defaultBranch || 'main',
      });
      
      // Update permissions in state
      dispatch(setPermissions({ user, repo: currentRepo, collaborators }));
    }
  }, [currentRepo, collaborators, user, dispatch]);

  useEffect(() => {
    if (settingsSuccess) {
      toast.success('Repository updated successfully');
      dispatch(resetSettingsState());
      dispatch(fetchRepoById(id));
    }
    if (settingsError) {
      toast.error(settingsError);
      dispatch(resetSettingsState());
    }
  }, [settingsSuccess, settingsError, dispatch, id]);

  useEffect(() => {
    if (collabSuccess) {
      toast.success('Collaborators updated successfully');
      dispatch(resetCollaboratorState());
      dispatch(fetchMembers(id));
      setInviteForm({ username: '', role: 'Contributor' });
      setTransferUsername('');
    }
    if (collabError) {
      toast.error(collabError);
      dispatch(resetCollaboratorState());
    }
  }, [collabSuccess, collabError, dispatch, id]);

  // Handle access verification
  if (repoLoading && !currentRepo) {
    return <Loader size="lg" text="Loading settings..." />;
  }

  if (currentRepo && !isMaintainer) {
    return (
      <div className="glass-card p-12 text-center text-red-400">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p>You must be a Repository Maintainer or Owner to access these settings.</p>
        <button onClick={() => navigate(`/repos/${id}`)} className="btn-secondary mt-6">
          Back to Repository
        </button>
      </div>
    );
  }

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    const formattedTopics = generalForm.topics
      ? generalForm.topics.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    dispatch(updateRepositorySettings({
      repoId: id,
      settingsData: {
        ...generalForm,
        topics: formattedTopics
      }
    }));
  };

  const handleVisibilityChange = () => {
    const nextVisibility = currentRepo.visibility === 'public' ? 'private' : 'public';
    dispatch(updateRepositoryVisibility({ repoId: id, visibility: nextVisibility }));
    setVisibilityModalOpen(false);
  };

  const handleArchiveToggle = () => {
    if (currentRepo.isArchived) {
      dispatch(unarchiveRepository(id));
    } else {
      dispatch(archiveRepository(id));
    }
    setArchiveModalOpen(false);
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteForm.username) return toast.error('Username is required');
    dispatch(inviteUser({ repoId: id, ...inviteForm }));
  };

  const handleRemoveCollab = (userId) => {
    if (window.confirm('Are you sure you want to remove this collaborator?')) {
      dispatch(removeCollaborator({ repoId: id, userId }));
    }
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    dispatch(transferOwnership({ repoId: id, username: transferUsername }));
    setTransferModalOpen(false);
  };

  const handleDeleteSubmit = () => {
    dispatch(deleteRepo(id))
      .unwrap()
      .then(() => {
        toast.success('Repository deleted successfully');
        navigate('/repos');
      })
      .catch((err) => {
        toast.error(err || 'Failed to delete repository');
      });
  };

  const isRepoOwner = isOwner;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-dark-700 pb-4">
        <FiSettings className="w-8 h-8 text-brand-400" />
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Settings</h1>
          <p className="text-sm text-dark-400">
            Configure {currentRepo?.name} settings, visibility, and collaborators
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex flex-row md:flex-col gap-1 overflow-x-auto border-b md:border-b-0 md:border-r border-dark-700 pb-3 md:pb-0 md:pr-4">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500'
                : 'text-dark-300 hover:bg-dark-800'
            }`}
          >
            <FiSettings className="w-4 h-4" />
            General
          </button>
          
          <button
            onClick={() => setActiveTab('visibility')}
            className={`flex items-center gap-2.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'visibility'
                ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500'
                : 'text-dark-300 hover:bg-dark-800'
            }`}
          >
            <FiShield className="w-4 h-4" />
            Visibility
          </button>

          <button
            onClick={() => setActiveTab('collaborators')}
            className={`flex items-center gap-2.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'collaborators'
                ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500'
                : 'text-dark-300 hover:bg-dark-800'
            }`}
          >
            <FiUsers className="w-4 h-4" />
            Collaborators
          </button>

          <button
            onClick={() => setActiveTab('guardian')}
            className={`flex items-center gap-2.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'guardian'
                ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500'
                : 'text-dark-300 hover:bg-dark-800'
            }`}
          >
            <FiShield className="w-4 h-4" />
            Guardian
          </button>

          {isRepoOwner && (
            <button
              onClick={() => setActiveTab('danger')}
              className={`flex items-center gap-2.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'danger'
                  ? 'bg-red-500/10 text-red-400 border-l-2 border-red-500'
                  : 'text-red-400/80 hover:bg-red-950/20'
              }`}
            >
              <FiAlertTriangle className="w-4 h-4" />
              Danger Zone
            </button>
          )}

          {isRepoOwner && (
            <button
              onClick={() => setActiveTab('guardian')}
              className={`flex items-center gap-2.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'guardian'
                  ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500'
                  : 'text-dark-300 hover:bg-dark-800'
              }`}
            >
              <FiCheckSquare className="w-4 h-4" />
              Guardian
            </button>
          )}
        </aside>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <form onSubmit={handleGeneralSubmit} className="space-y-6 glass-card p-6">
              <h2 className="text-xl font-bold text-dark-100 pb-3 border-b border-dark-700">General Settings</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="input-label" htmlFor="repoName">Repository Name</label>
                  <input
                    type="text"
                    id="repoName"
                    className="input-field"
                    value={generalForm.name}
                    onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="input-label" htmlFor="defaultBranch">Default Branch</label>
                  <input
                    type="text"
                    id="defaultBranch"
                    className="input-field"
                    value={generalForm.defaultBranch}
                    onChange={(e) => setGeneralForm({ ...generalForm, defaultBranch: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="input-field min-h-[80px] resize-none"
                  value={generalForm.description}
                  onChange={(e) => setGeneralForm({ ...generalForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="input-label" htmlFor="website">Website URL (Optional)</label>
                  <input
                    type="text"
                    id="website"
                    className="input-field"
                    value={generalForm.website}
                    onChange={(e) => setGeneralForm({ ...generalForm, website: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label" htmlFor="license">License (Optional)</label>
                  <input
                    type="text"
                    id="license"
                    className="input-field"
                    placeholder="e.g. MIT, Apache 2.0"
                    value={generalForm.license}
                    onChange={(e) => setGeneralForm({ ...generalForm, license: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="input-label" htmlFor="topics">Topics (comma separated)</label>
                <input
                  type="text"
                  id="topics"
                  className="input-field"
                  placeholder="e.g. react, nodejs, tailwind"
                  value={generalForm.topics}
                  onChange={(e) => setGeneralForm({ ...generalForm, topics: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-dark-700">
                <button type="submit" disabled={settingsLoading} className="btn-primary w-32 flex justify-center">
                  {settingsLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* VISIBILITY TAB */}
          {activeTab === 'visibility' && (
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-xl font-bold text-dark-100 pb-3 border-b border-dark-700">Repository Visibility</h2>

              <div className="flex flex-col gap-4">
                <div className={`p-5 rounded-xl border flex items-start gap-4 ${
                  currentRepo.visibility === 'public'
                    ? 'border-brand-500/30 bg-brand-500/5'
                    : 'border-dark-700 bg-dark-800/30'
                }`}>
                  <FiGlobe className="w-6 h-6 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-dark-100">Public Repository</h3>
                    <p className="text-sm text-dark-300 mt-1">
                      Anyone on the internet can search, view, clone, and watch this repository. Standard developer rules apply.
                    </p>
                  </div>
                </div>

                <div className={`p-5 rounded-xl border flex items-start gap-4 ${
                  currentRepo.visibility === 'private'
                    ? 'border-brand-500/30 bg-brand-500/5'
                    : 'border-dark-700 bg-dark-800/30'
                }`}>
                  <FiLock className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-dark-100">Private Repository</h3>
                    <p className="text-sm text-dark-300 mt-1">
                      Only the repository owner and authorized collaborators can access, clone, pull, or push to this repository.
                    </p>
                  </div>
                </div>
              </div>

              {isRepoOwner ? (
                <div className="flex justify-end pt-4 border-t border-dark-700">
                  <button 
                    type="button" 
                    onClick={() => setVisibilityModalOpen(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    Change Visibility to {currentRepo.visibility === 'public' ? 'Private' : 'Public'}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-dark-400 mt-2 flex items-center gap-1.5 bg-dark-800/50 p-3 rounded-lg">
                  <FiInfo className="text-dark-300" /> Only the repository owner can modify the visibility settings.
                </p>
              )}
            </div>
          )}

          {/* COLLABORATORS TAB */}
          {activeTab === 'collaborators' && (
            <div className="space-y-6">
              
              {/* Invite User Card */}
              {isRepoOwner && (
                <form onSubmit={handleInviteSubmit} className="glass-card p-6 space-y-4">
                  <h2 className="text-lg font-bold text-dark-100 flex items-center gap-2">
                    <FiUserPlus className="text-brand-400" /> Invite Collaborator
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Search by username..."
                        className="input-field"
                        value={inviteForm.username}
                        onChange={(e) => setInviteForm({ ...inviteForm, username: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <select
                        className="input-field"
                        value={inviteForm.role}
                        onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                      >
                        <option value="Contributor">Contributor (Push/Pull)</option>
                        <option value="Maintainer">Maintainer (Manage/Edit)</option>
                        <option value="Viewer">Viewer (Read-only)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={collabLoading} className="btn-primary">
                      {collabLoading ? 'Sending...' : 'Send Invitation'}
                    </button>
                  </div>
                </form>
              )}

              {/* Members List */}
              <div className="glass-card p-6 space-y-4">
                <h2 className="text-lg font-bold text-dark-100">Repository Members</h2>
                
                <div className="space-y-3">
                  {/* Owner */}
                  {owner && (
                    <div className="flex items-center justify-between p-3.5 bg-dark-800/40 border border-dark-700/60 rounded-xl">
                      <div className="flex items-center gap-3">
                        {owner.avatar ? (
                          <img src={owner.avatar} alt={owner.username} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center uppercase">
                            {owner.username.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-dark-100">{owner.displayName || owner.username}</p>
                          <p className="text-xs text-dark-400">@{owner.username}</p>
                        </div>
                      </div>
                      <span className="badge border border-brand-500/30 bg-brand-500/10 text-brand-400">
                        Owner
                      </span>
                    </div>
                  )}

                  {/* Collaborators */}
                  {collaborators?.length > 0 ? (
                    collaborators.map((c) => (
                      <div key={c._id} className="flex items-center justify-between p-3.5 bg-dark-800/20 border border-dark-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          {c.user.avatar ? (
                            <img src={c.user.avatar} alt={c.user.username} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-dark-700 text-dark-300 font-bold flex items-center justify-center uppercase">
                              {c.user.username.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-dark-100">{c.user.displayName || c.user.username}</p>
                            <p className="text-xs text-dark-400">@{c.user.username}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`badge ${
                            c.status === 'Accepted'
                              ? 'border-green-500/30 bg-green-500/10 text-green-400'
                              : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {c.role} ({c.status})
                          </span>

                          {isRepoOwner && (
                            <button
                              onClick={() => handleRemoveCollab(c.user._id)}
                              className="p-2 hover:bg-red-500/10 text-dark-400 hover:text-red-400 rounded-lg transition-colors"
                              title="Remove Collaborator"
                            >
                              <FiUserMinus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-dark-400 text-sm">
                      No collaborators added yet.
                    </div>
                  )}
                </div>

                {isRepoOwner && (
                  <div className="pt-4 border-t border-dark-700 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => setTransferModalOpen(true)}
                      className="btn-danger-ghost flex items-center gap-2"
                    >
                      Transfer Ownership
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'guardian' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-dark-100 border-b border-dark-700 pb-2">CodeForge Guardian™ Settings</h2>
              <GuardianSettings repoId={id} />
            </div>
          )}

          {/* DANGER ZONE TAB */}
          {activeTab === 'danger' && isRepoOwner && (
            <div className="glass-card border border-red-500/30 bg-red-500/5 p-6 space-y-6">
              <h2 className="text-xl font-bold text-red-400 pb-3 border-b border-red-500/20">Danger Zone</h2>

              <div className="space-y-4 divide-y divide-red-500/10">
                
                {/* Archive / Unarchive */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 first:pt-0">
                  <div>
                    <h3 className="font-bold text-dark-100">
                      {currentRepo.isArchived ? 'Unarchive this repository' : 'Archive this repository'}
                    </h3>
                    <p className="text-xs text-dark-400 mt-1">
                      {currentRepo.isArchived 
                        ? 'Restore this repository to enable commits, file additions and edit functionality.' 
                        : 'Mark this repository as read-only. Commits, file edits and settings updates will be locked.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setArchiveModalOpen(true)} 
                    className="btn-danger w-40 shrink-0"
                  >
                    {currentRepo.isArchived ? 'Unarchive' : 'Archive'}
                  </button>
                </div>

                {/* Delete Repo */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
                  <div>
                    <h3 className="font-bold text-dark-100">Delete this repository</h3>
                    <p className="text-xs text-dark-400 mt-1">
                      Permanently delete the repository, all commits, historical files, and contribution metadata. This cannot be undone.
                    </p>
                  </div>
                  <button 
                    onClick={() => setDeleteModalOpen(true)} 
                    className="btn-danger w-40 shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* GUARDIAN TAB */}
          {activeTab === 'guardian' && isRepoOwner && (
            <GuardianSettings repoId={id} />
          )}

        </div>
      </div>

      {/* Visibility Change Modal */}
      <Modal
        isOpen={visibilityModalOpen}
        onClose={() => setVisibilityModalOpen(false)}
        title="Change Repository Visibility"
      >
        <div className="space-y-4">
          <p className="text-dark-300 text-sm">
            Are you sure you want to change the visibility of <strong className="text-brand-400">{currentRepo?.name}</strong> to{' '}
            <strong className="text-dark-100">{currentRepo?.visibility === 'public' ? 'Private' : 'Public'}</strong>?
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-xs text-yellow-500 flex items-start gap-2">
            <FiAlertTriangle className="shrink-0 mt-0.5" />
            <span>Changing visibility can affect active collaborator access and search configurations.</span>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setVisibilityModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleVisibilityChange} className="btn-primary">Confirm</button>
          </div>
        </div>
      </Modal>

      {/* Archive Modal */}
      <Modal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        title={currentRepo?.isArchived ? 'Unarchive Repository' : 'Archive Repository'}
      >
        <div className="space-y-4">
          <p className="text-dark-300 text-sm">
            Are you sure you want to {currentRepo?.isArchived ? 'unarchive' : 'archive'} <strong className="text-brand-400">{currentRepo?.name}</strong>?
          </p>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setArchiveModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleArchiveToggle} className="btn-primary">Confirm</button>
          </div>
        </div>
      </Modal>

      {/* Transfer Ownership Modal */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Transfer Repository Ownership"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          <p className="text-dark-300 text-sm">
            Enter the username of the user you want to transfer ownership of <strong className="text-brand-400">{currentRepo?.name}</strong> to.
          </p>
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-xs text-red-400 flex items-start gap-2">
            <FiAlertTriangle className="shrink-0 mt-0.5" />
            <span>WARNING: You will lose owner privileges and become a Maintainer. This action is irreversible.</span>
          </div>
          <div>
            <label className="input-label" htmlFor="transferUser">New Owner Username</label>
            <input
              type="text"
              id="transferUser"
              className="input-field"
              placeholder="Enter username..."
              value={transferUsername}
              onChange={(e) => setTransferUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button type="button" onClick={() => setTransferModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-danger">Transfer Ownership</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Repository"
      >
        <div className="space-y-4">
          <p className="text-dark-300 text-sm">
            Are you sure you want to permanently delete <strong className="text-red-400">{currentRepo?.name}</strong>? 
            All files, commits, branches, and collaboration records will be permanently removed.
          </p>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleDeleteSubmit} className="btn-danger">Permanently Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RepositorySettingsPage;
