import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserRepos } from '../features/repos/repoThunks.js';
import RepoList from '../components/repo/RepoList';
import { FiPlus, FiGithub } from 'react-icons/fi';

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
            <FiGithub className="w-8 h-8 text-brand-500" />
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
