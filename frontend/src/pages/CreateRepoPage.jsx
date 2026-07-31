import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createRepo } from '../features/repos/repoThunks';
import { clearRepoError } from '../features/repos/repoSlice';
import { FiBook, FiLock, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreateRepoPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.repos);
  const { user } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (error) dispatch(clearRepoError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Repository name is required');
      return;
    }

    try {
      const newRepo = await dispatch(createRepo(formData)).unwrap();
      toast.success('Repository created successfully!');
      navigate(`/repos/${newRepo._id}`);
    } catch (err) {
      toast.error(err || 'Failed to create repository');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8 border-b border-dark-700/50 pb-6">
        <h1 className="text-3xl font-bold text-dark-50 mb-2">Create a new repository</h1>
        <p className="text-dark-400">
          A repository contains all project files, including the revision history.
        </p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1">Owner</label>
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-lg border border-dark-700 w-fit">
            <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-dark-100">{user?.username}</span>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-dark-300 mb-1">
            Repository name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-field max-w-md font-mono"
            placeholder="my-awesome-project"
            autoFocus
          />
          <p className="mt-2 text-xs text-dark-400 flex items-center gap-1">
            <FiInfo className="w-3.5 h-3.5" />
            Great repository names are short and memorable.
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-dark-300 mb-1">
            Description <span className="text-dark-500 text-xs font-normal">(optional)</span>
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            placeholder="What is this repository about?"
          />
        </div>

        <div className="border-t border-dark-700/50 pt-8">
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 rounded-xl border border-dark-700 bg-dark-800/50 cursor-pointer hover:border-brand-500/50 transition-colors">
              <input
                type="radio"
                name="visibility"
                checked={!formData.isPrivate}
                onChange={() => setFormData({ ...formData, isPrivate: false })}
                className="mt-1 w-4 h-4 text-brand-500 bg-dark-900 border-dark-600 focus:ring-brand-500 focus:ring-offset-dark-900"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FiBook className="text-dark-300" />
                  <span className="font-semibold text-dark-100">Public</span>
                </div>
                <p className="text-sm text-dark-400">
                  Anyone on the internet can see this repository. You choose who can commit.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-dark-700 bg-dark-800/50 cursor-pointer hover:border-brand-500/50 transition-colors">
              <input
                type="radio"
                name="visibility"
                checked={formData.isPrivate}
                onChange={() => setFormData({ ...formData, isPrivate: true })}
                className="mt-1 w-4 h-4 text-brand-500 bg-dark-900 border-dark-600 focus:ring-brand-500 focus:ring-offset-dark-900"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FiLock className="text-amber-400" />
                  <span className="font-semibold text-dark-100">Private</span>
                </div>
                <p className="text-sm text-dark-400">
                  You choose who can see and commit to this repository.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-dark-700/50 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full sm:w-auto"
          >
            {loading ? 'Creating repository...' : 'Create repository'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRepoPage;
