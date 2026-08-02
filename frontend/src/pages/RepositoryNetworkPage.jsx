import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRepositoryNetwork, clearNetworkData } from '../features/repos/forkNetworkSlice';
import { fetchRepoById } from '../features/repos/repoThunks';
import Loader from '../components/common/Loader';
import { FiGitBranch, FiUser, FiActivity } from 'react-icons/fi';

const RepositoryNetworkPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { network, loading, error } = useSelector((state) => state.forkNetwork);
  const { currentRepo } = useSelector((state) => state.repos);

  useEffect(() => {
    dispatch(fetchRepoById(id));
    dispatch(fetchRepositoryNetwork(id));

    return () => {
      dispatch(clearNetworkData());
    };
  }, [dispatch, id]);

  if (loading && network.length === 0) {
    return <Loader size="lg" text="Loading network graph..." />;
  }

  if (error) {
    return (
      <div className="glass-card p-12 text-center text-red-400">
        <h2 className="text-xl font-bold mb-2">Error loading network</h2>
        <p>{error}</p>
        <Link to={`/repos/${id}`} className="btn-secondary mt-6 inline-block">Back to Repository</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-dark-700/50 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2">
            <FiActivity className="text-brand-400" /> Fork Network
          </h1>
          {currentRepo && (
            <p className="text-sm text-dark-300 mt-1">
              Network graph for <Link to={`/repos/${currentRepo._id}`} className="text-brand-400 hover:underline">{currentRepo.name}</Link>
            </p>
          )}
        </div>
        <Link to={`/repos/${id}`} className="btn-secondary h-9 px-4">
          Back to Repo
        </Link>
      </div>

      <div className="glass-card p-6">
        {network && network.length > 0 ? (
          <div className="space-y-4">
            {network.map((repo, index) => (
              <div 
                key={repo._id} 
                className={`flex items-center gap-4 p-4 rounded-lg border ${repo._id === id ? 'border-brand-500/50 bg-brand-500/10' : 'border-dark-700 bg-dark-800'}`}
                style={{ marginLeft: `${(repo.forkDepth || 0) * 2}rem` }}
              >
                <FiGitBranch className="text-dark-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {repo.owner?.avatar ? (
                      <img src={repo.owner.avatar} alt="avatar" className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-dark-700 flex items-center justify-center">
                        <FiUsers className="w-3 h-3 text-dark-400" />
                      </div>
                    )}
                    <Link to={`/${repo.owner?.username}/${repo.name}`} className="text-brand-400 font-semibold hover:underline">
                      {repo.owner?.username} / {repo.name}
                    </Link>
                    {repo._id === id && (
                      <span className="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/30">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-dark-400 mt-1 flex items-center gap-3">
                    <span>Forks: {repo.forkCount || 0}</span>
                    <span>Created on {new Date(repo.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-dark-400">
            <FiGitBranch className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No forks found in this network yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoryNetworkPage;
