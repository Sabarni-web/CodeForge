import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProfile, updateProfileSocial } from '../features/profile/profileSlice';
import { sendFollowRequest, cancelFollowRequest, fetchFollowStatus } from '../features/follow/followSlice';
import Loader from '../components/common/Loader';
import {
  FiMapPin,
  FiLink,
  FiCalendar,
  FiUsers,
  FiBookOpen,
  FiEdit,
  FiPlus,
  FiCheck,
  FiClock,
  FiUserPlus,
  FiSave,
  FiX,
  FiEye,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const PublicProfilePage = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { profile, loading, error } = useSelector((state) => state.profile);
  const currentUser = useSelector((state) => state.auth.user);
  const { isFollowing, isPending, requestId, loading: followLoading } = useSelector((state) => state.follow);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    avatar: '',
    coverImage: '',
    location: '',
    website: '',
  });

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const isOwnProfile = currentUser && currentUser.username === username;

  useEffect(() => {
    if (username) {
      dispatch(fetchProfile(username));
    }
  }, [dispatch, username]);

  useEffect(() => {
    if (profile && currentUser && !isOwnProfile) {
      dispatch(fetchFollowStatus(profile._id));
    }
  }, [dispatch, profile, currentUser, isOwnProfile]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        coverImage: profile.coverImage || '',
        location: profile.location || '',
        website: profile.website || '',
      });
    }
  }, [profile]);

  const handleFollowAction = async () => {
    if (followLoading || !profile) return;
    try {
      if (isFollowing) {
        toast.error('Unfollowing is not implemented yet.');
      } else if (isPending) {
        await dispatch(cancelFollowRequest(requestId)).unwrap();
        toast.success('Follow request cancelled');
        dispatch(fetchFollowStatus(profile._id));
      } else {
        await dispatch(sendFollowRequest(profile._id)).unwrap();
        toast.success('Follow request sent');
        dispatch(fetchFollowStatus(profile._id));
      }
    } catch (err) {
      toast.error(err || 'Failed to update follow status');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfileSocial(editForm)).unwrap();
      toast.success('Profile updated successfully');
      setEditModalOpen(false);
      dispatch(fetchProfile(username)); // reload profile
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Avatar = reader.result;
        try {
          await dispatch(updateProfileSocial({ avatar: base64Avatar })).unwrap();
          toast.success('Profile photo updated successfully');
          dispatch(fetchProfile(username));
        } catch (error) {
          toast.error('Failed to update profile photo');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Cover = reader.result;
        try {
          await dispatch(updateProfileSocial({ coverImage: base64Cover })).unwrap();
          toast.success('Cover photo updated successfully');
          dispatch(fetchProfile(username));
        } catch (error) {
          toast.error('Failed to update cover photo');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <Loader size="lg" text="Loading developer profile..." />;
  if (error) {
    return (
      <div className="page-container max-w-4xl text-center py-12">
        <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Profile</h3>
        <p className="text-dark-400 mb-6">{error}</p>
        <button onClick={() => navigate('/repos')} className="btn-primary">Back to Safety</button>
      </div>
    );
  }
  if (!profile) return null;

  // Generate a mock contributions grid representing last year (53 weeks * 7 days = 371 cells)
  const generateContributions = () => {
    const calendar = profile.contributionStats?.calendar || {};
    const cells = [];
    const totalDays = 371;
    const now = new Date();
    
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = calendar[dateStr] || 0;
      
      let level = 'bg-dark-800'; // 0 commits
      if (count > 0 && count <= 2) level = 'bg-green-900/60';
      if (count > 2 && count <= 5) level = 'bg-green-700/80';
      if (count > 5) level = 'bg-green-500';

      cells.push({ date: dateStr, count, level });
    }
    return cells;
  };

  const contributionCells = generateContributions();
  const totalCommits = profile.contributionStats?.totalCommits || 0;

  return (
    <div className="min-h-screen pb-12 bg-dark-950 text-dark-100">
      {/* Cover Banner */}
      <div className="h-48 md:h-64 w-full relative overflow-hidden bg-gradient-to-r from-brand-900/40 via-dark-900 to-indigo-950/40 border-b border-dark-800 group">
        {profile.coverImage ? (
          <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
        )}
        {isOwnProfile && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => coverInputRef.current?.click()}
              className="bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 backdrop-blur-sm border border-white/10"
            >
              <FiEdit className="w-4 h-4" /> Change Cover
            </button>
            <input 
              type="file" 
              ref={coverInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleCoverChange} 
            />
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 md:-mt-28 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left Column Profile info card */}
          <div className="w-full md:w-1/4">
            <div className="glass-card p-6 flex flex-col items-center md:items-start border border-dark-800 shadow-2xl">
              <div 
                className={`w-36 h-36 md:w-44 md:h-44 rounded-full bg-dark-900 border-4 border-dark-850 overflow-hidden shadow-xl mb-4 relative group ${isOwnProfile ? 'cursor-pointer' : ''}`}
                onClick={() => isOwnProfile && fileInputRef.current?.click()}
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-dark-800 flex items-center justify-center font-bold text-5xl text-dark-400">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium text-white text-center px-2">Upload Photo</span>
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                />
              )}

              <h2 className="text-2xl font-extrabold text-dark-50">{profile.displayName || profile.username}</h2>
              <p className="text-dark-400 text-sm">@{profile.username}</p>

              {profile.bio && (
                <p className="text-dark-300 text-sm mt-4 text-center md:text-left border-t border-dark-800/80 pt-4 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="w-full mt-4 space-y-2 border-t border-dark-800/80 pt-4 text-xs text-dark-400">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-dark-500 w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-2">
                    <FiLink className="text-dark-500 w-4 h-4" />
                    <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-400">
                      {profile.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-dark-500 w-4 h-4" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                </div>
              </div>

              {/* Social counts */}
              <div className="flex items-center justify-between w-full mt-5 border-t border-dark-800/80 pt-4 text-xs text-dark-400">
                <Link to={`/profile/${profile.username}/followers`} className="hover:text-brand-400 flex items-center gap-1.5 transition-colors">
                  <FiUsers className="w-4 h-4" />
                  <span className="font-bold text-dark-200">{profile.followers?.length || 0}</span> followers
                </Link>
                <span>•</span>
                <Link to={`/profile/${profile.username}/following`} className="hover:text-brand-400 flex items-center gap-1.5 transition-colors">
                  <span className="font-bold text-dark-200">{profile.following?.length || 0}</span> following
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-6 space-y-2">
                {isOwnProfile ? (
                  <>
                    <button onClick={() => setEditModalOpen(true)} className="w-full btn-secondary text-sm flex items-center justify-center gap-2 py-2.5">
                      <FiEdit className="w-4 h-4" /> Edit Profile
                    </button>
                    <Link to="/repos/new" className="w-full btn-primary text-sm flex items-center justify-center gap-2 py-2.5">
                      <FiPlus className="w-4 h-4" /> New Repository
                    </Link>
                  </>
                ) : (
                  currentUser && (
                    <button
                      onClick={handleFollowAction}
                      disabled={followLoading}
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                        isFollowing
                          ? 'bg-dark-800 text-dark-200 border border-dark-700'
                          : isPending
                          ? 'bg-dark-900 text-yellow-500 border border-yellow-500/30'
                          : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-650/10'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <FiCheck className="w-4 h-4 text-green-500" /> Following
                        </>
                      ) : isPending ? (
                        <>
                          <FiClock className="w-4 h-4" /> Pending Approval
                        </>
                      ) : (
                        <>
                          <FiUserPlus className="w-4 h-4" /> Follow
                        </>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right Column details card */}
          <div className="w-full md:w-3/4 space-y-6">
            {/* Pinned Repositories */}
            <div>
              <h3 className="text-lg font-bold text-dark-100 mb-3 flex items-center gap-2">
                <FiBookOpen className="w-5 h-5 text-brand-500" />
                Pinned Repositories
              </h3>
              {profile.pinnedRepositories?.length === 0 ? (
                <div className="glass-card p-6 text-center text-dark-400 text-sm">
                  No pinned repositories to display.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.pinnedRepositories.map((repo) => (
                    <Link
                      key={repo._id}
                      to={`/repos/${repo._id}`}
                      className="glass-card p-5 hover:border-dark-600/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-400 text-sm hover:underline">{repo.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-dark-700 text-dark-400 uppercase">
                            {repo.isPrivate ? 'Private' : 'Public'}
                          </span>
                        </div>
                        <p className="text-xs text-dark-300 mt-2 line-clamp-2">{repo.description || 'No description provided.'}</p>
                      </div>
                      <div className="mt-4 flex items-center gap-4 text-xs text-dark-400">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                            {repo.language}
                          </span>
                        )}
                        <span>⭐ {repo.stars?.length || 0}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Contributions Grid */}
            <div className="glass-card p-6">
              <h3 className="text-md font-bold text-dark-200 mb-4 flex items-center justify-between">
                <span>{totalCommits} contributions in the last year</span>
                <span className="text-xs text-dark-500 font-normal">GitHub Mock Grid</span>
              </h3>
              {/* Heat Map grid */}
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
                <div className="grid grid-flow-col grid-rows-7 gap-1">
                  {contributionCells.map((c, idx) => (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-sm ${c.level} transition-all`}
                      title={`${c.count} commits on ${c.date}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Original Repositories */}
            <div>
              <h3 className="text-lg font-bold text-dark-100 mb-3 flex items-center gap-2">
                <FiBookOpen className="w-5 h-5 text-indigo-400" />
                Original Repositories
              </h3>
              {profile.recentRepositories?.filter(r => !r.isFork).length === 0 ? (
                <div className="glass-card p-6 text-center text-dark-400 text-sm">
                  This user has no original repositories.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.recentRepositories?.filter(r => !r.isFork).map((repo) => (
                    <Link
                      key={repo._id}
                      to={`/repos/${repo._id}`}
                      className="glass-card p-5 hover:border-dark-600/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-400 text-sm hover:underline">{repo.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-dark-700 text-dark-400 uppercase">
                            {repo.isPrivate ? 'Private' : 'Public'}
                          </span>
                        </div>
                        <p className="text-xs text-dark-300 mt-2 line-clamp-2">{repo.description || 'No description provided.'}</p>
                      </div>
                      <div className="mt-4 flex items-center gap-4 text-xs text-dark-400">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                            {repo.language}
                          </span>
                        )}
                        <span>⭐ {repo.stars?.length || 0}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Forked Repositories */}
            {profile.recentRepositories?.filter(r => r.isFork).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-dark-100 mb-3 flex items-center gap-2">
                  <FiBookOpen className="w-5 h-5 text-brand-400" />
                  Forked Repositories
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.recentRepositories.filter(r => r.isFork).map((repo) => (
                    <Link
                      key={repo._id}
                      to={`/repos/${repo._id}`}
                      className="glass-card p-5 hover:border-dark-600/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-400 text-sm hover:underline">{repo.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-dark-700 text-dark-400 uppercase">
                            {repo.isPrivate ? 'Private' : 'Public'}
                          </span>
                        </div>
                        <p className="text-xs text-dark-400 mt-1">
                          Forked from {repo.forkSourceOwner}/{repo.forkSourceRepository}
                        </p>
                        <p className="text-xs text-dark-300 mt-2 line-clamp-2">{repo.description || 'No description provided.'}</p>
                      </div>
                      <div className="mt-4 flex items-center gap-4 text-xs text-dark-400">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                            {repo.language}
                          </span>
                        )}
                        <span>⭐ {repo.stars?.length || 0}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute right-4 top-4 p-2 text-dark-400 hover:text-dark-100 rounded-lg hover:bg-dark-800 transition-colors">
              <FiX className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-dark-50 mb-6 flex items-center gap-2">
              <FiEdit className="text-brand-500" /> Edit Social Profile
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="input-label">Display Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. John Doe"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Bio</label>
                <textarea
                  className="input-field min-h-[80px]"
                  placeholder="Brief biography..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  maxLength={300}
                />
              </div>

              <div>
                <label className="input-label">Avatar URL</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://example.com/avatar.png"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Cover Image URL</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://example.com/cover.png"
                  value={editForm.coverImage}
                  onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Location</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. San Francisco, CA"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Website</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. github.com"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-dark-800">
                <button type="button" onClick={() => setEditModalOpen(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <FiSave /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;
