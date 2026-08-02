import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileAPI } from '../api/commitApi'; // using commitApi.js for user profile for now based on previous structure
import { fetchMe } from '../features/auth/authThunks';
import { fetchDashboard } from '../features/guardian/guardianDashboardSlice';
import Loader from '../components/common/Loader';
import { FiUser, FiMail, FiEdit3, FiSave, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const { data: guardianData, loading: guardianLoading } = useSelector((state) => state.guardianDashboard);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ bio: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      dispatch(fetchDashboard());
    }
  }, [user, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileAPI(formData);
      await dispatch(fetchMe()).unwrap();
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
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
        setFormData({ ...formData, avatar: base64Avatar });
        
        if (!isEditing) {
          setSaving(true);
          try {
            await updateProfileAPI({ ...formData, avatar: base64Avatar });
            await dispatch(fetchMe()).unwrap();
            toast.success('Profile photo updated successfully');
          } catch (error) {
            toast.error('Failed to update profile photo');
          } finally {
            setSaving(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && !user) return <Loader size="lg" text="Loading profile..." />;
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-dark-700/50">
        <h1 className="text-3xl font-bold text-dark-50">Profile Settings</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2">
            <FiEdit3 /> Edit Profile
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div 
            className={`w-48 h-48 rounded-full bg-dark-800 border-4 border-dark-700 overflow-hidden flex items-center justify-center shadow-xl mb-4 relative group cursor-pointer`}
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.avatar ? (
              <img src={formData.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl font-bold text-dark-400 select-none">
                {user.username?.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-medium text-white">Upload Photo</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAvatarChange} 
          />
          <h2 className="text-xl font-bold text-dark-100">{user.username}</h2>
          <p className="text-dark-400 text-sm flex items-center gap-2 mt-1">
            <FiMail className="w-4 h-4" /> {user.email}
          </p>
        </div>

        <div className="w-full md:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6 bg-dark-900 border border-dark-700 rounded-xl p-6 shadow-xl">
            <div>
              <label className="input-label" htmlFor="username">Username (cannot be changed)</label>
              <input
                type="text"
                id="username"
                className="input-field bg-dark-800/50 text-dark-400 cursor-not-allowed"
                value={user.username}
                disabled
              />
            </div>

            <div>
              <label className="input-label" htmlFor="avatar">Avatar URL (or upload image above)</label>
              <input
                type="text"
                id="avatar"
                className={`input-field ${!isEditing && 'bg-dark-800/50 cursor-not-allowed'}`}
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar.length > 200 ? 'Image uploaded...' : formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="input-label" htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                className={`input-field min-h-[120px] resize-none ${!isEditing && 'bg-dark-800/50 cursor-not-allowed'}`}
                placeholder="Tell us a little bit about yourself"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                maxLength={300}
              />
              <div className="text-right mt-1 text-xs text-dark-500">
                {formData.bio.length} / 300
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-700/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ bio: user.bio || '', avatar: user.avatar || '' });
                  }}
                  className="btn-ghost"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FiSave />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </form>

          {/* Guardian Stats & Achievements */}
          {!guardianLoading && guardianData && (
            <div className="mt-8 bg-dark-900 border border-dark-700 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2 mb-6">
                <FiShield className="text-emerald-400" /> Guardian Statistics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-dark-800 rounded border border-dark-700">
                  <div className="text-2xl font-bold text-emerald-400">{guardianData.overview.protectedRepositories}</div>
                  <div className="text-xs text-dark-400">Protected Repos</div>
                </div>
                <div className="text-center p-4 bg-dark-800 rounded border border-dark-700">
                  <div className="text-2xl font-bold text-dark-200">{guardianData.overview.certificatesGenerated}</div>
                  <div className="text-xs text-dark-400">Certificates</div>
                </div>
                <div className="text-center p-4 bg-dark-800 rounded border border-dark-700">
                  <div className="text-2xl font-bold text-dark-200">{guardianData.overview.verificationRequestsMade}</div>
                  <div className="text-xs text-dark-400">Verifications</div>
                </div>
                <div className="text-center p-4 bg-dark-800 rounded border border-dark-700">
                  <div className="text-2xl font-bold text-brand-400">{guardianData.overview.verificationsMatched}</div>
                  <div className="text-xs text-dark-400">Verified Matches</div>
                </div>
              </div>

              <h3 className="font-semibold text-dark-100 mb-4">Achievements</h3>
              <div className="flex flex-wrap gap-4">
                {guardianData.overview.protectedRepositories > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-semibold" title="Has at least one protected repository">
                    <FiShield className="w-5 h-5" /> Guardian Protected
                  </div>
                )}
                {guardianData.overview.verificationsMatched > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-brand-900/20 border border-brand-500/30 text-brand-400 rounded-lg text-sm font-semibold" title="Code originality verified">
                    <FiShield className="w-5 h-5" /> Verified Author
                  </div>
                )}
                {guardianData.overview.protectedRepositories >= 5 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-900/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold" title="Early adopter of Guardian">
                    <FiShield className="w-5 h-5" /> Guardian Pioneer
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
