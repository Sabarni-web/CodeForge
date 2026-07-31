import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommits } from '../features/files/fileThunks';
import { fetchRepoById } from '../features/repos/repoThunks';
import Loader from '../components/common/Loader';
import { FiGitCommit, FiArrowLeft, FiClock, FiFile } from 'react-icons/fi';
import { timeAgo, formatDate } from '../utils/dateFormatter';

const CommitHistoryPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { commits, loading, error, totalCommits } = useSelector((state) => state.files);
  const { currentRepo } = useSelector((state) => state.repos);

  useEffect(() => {
    if (!currentRepo || currentRepo._id !== id) {
      dispatch(fetchRepoById(id));
    }
    dispatch(fetchCommits({ repoId: id, page: 1 }));
  }, [dispatch, id, currentRepo]);

  if (loading && commits.length === 0) return <Loader size="lg" text="Loading commit history..." />;

  if (error) {
    return (
      <div className="glass-card p-12 text-center text-red-400">
        <p>{error}</p>
        <Link to={`/repos/${id}`} className="btn-secondary mt-6 inline-block">Back to Repository</Link>
      </div>
    );
  }

  // Group commits by date
  const groupedCommits = commits.reduce((acc, commit) => {
    const date = new Date(commit.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(commit);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-8 border-b border-dark-700/50 pb-6">
        <Link to={`/repos/${id}`} className="p-2 rounded-lg bg-dark-800 text-dark-300 hover:text-dark-100 transition-colors">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-3">
            <FiGitCommit className="text-brand-500" /> Commit History
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {currentRepo ? `${currentRepo.owner.username} / ${currentRepo.name}` : ''} • {totalCommits} commits
          </p>
        </div>
      </div>

      <div className="relative border-l-2 border-dark-700 ml-4 pl-8 space-y-10">
        {Object.keys(groupedCommits).map((date) => (
          <div key={date}>
            <div className="absolute -left-3 w-6 h-6 bg-dark-800 border-2 border-dark-600 rounded-full flex items-center justify-center mt-1">
              <div className="w-2 h-2 bg-dark-400 rounded-full" />
            </div>
            
            <h3 className="text-sm font-semibold text-dark-300 mb-4 bg-dark-900 border border-dark-700 inline-block px-3 py-1 rounded-full">
              Commits on {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>

            <div className="space-y-4">
              {groupedCommits[date].map((commit) => (
                <div key={commit._id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 group">
                  <div className="flex-1">
                    <p className="font-semibold text-dark-100 text-base mb-2 group-hover:text-brand-400 transition-colors">
                      {commit.message}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-dark-400">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-dark-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {commit.author?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-dark-200">{commit.author?.username || 'Unknown'}</span>
                      </div>
                      <span className="text-dark-600">•</span>
                      <span className="flex items-center gap-1">
                        <FiClock /> {timeAgo(commit.createdAt)}
                      </span>
                    </div>

                    {commit.files && commit.files.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-dark-700/50 flex flex-col gap-1">
                        <span className="text-xs text-dark-500 font-medium mb-1">Changed files:</span>
                        {commit.files.map((f, i) => (
                          <div key={i} className="text-xs text-dark-300 flex items-center gap-2 font-mono">
                            <span className={`w-2 h-2 rounded-full ${
                              f.action === 'added' ? 'bg-green-500' :
                              f.action === 'deleted' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                            {f.filePath}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="font-mono text-sm text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-1 rounded">
                      {commit.shortHash}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {commits.length === 0 && !loading && (
          <div className="text-dark-400">No commits found in this repository.</div>
        )}
      </div>
    </div>
  );
};

export default CommitHistoryPage;
