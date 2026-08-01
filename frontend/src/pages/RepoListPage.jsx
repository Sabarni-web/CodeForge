import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserRepos } from '../features/repos/repoThunks.js';
import RepoList from '../components/repo/RepoList';
import { FiPlus, FiCode } from 'react-icons/fi';

const RepoListPage = () => {
  const dispatch = useDispatch();
  const { repositories, loading, error } = useSelector((state) => state.repos);

  useEffect(() => {
    dispatch(fetchUserRepos());
  }, [dispatch]);

  return (
    <div className="page-container max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <FiCode className="w-5 h-5" />
            </div>
            Your Repositories
          </h1>
          <p className="text-dark-400">Manage your projects and code</p>
        </div>
        <Link to="/repos/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          <span>New Repository</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 mb-6">
          {error}
        </div>
      )}

      <RepoList repos={repositories} loading={loading} />
    </div>
  );
};

export default RepoListPage;
