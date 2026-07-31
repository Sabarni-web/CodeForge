import { Link } from 'react-router-dom';
import { FiBook, FiLock, FiStar, FiClock, FiGitPullRequest, FiGlobe } from 'react-icons/fi';
import { timeAgo } from '../../utils/dateFormatter';

const RepoCard = ({ repo }) => {
  const isPrivate = repo.visibility === 'private' || repo.isPrivate;

  return (
    <Link to={`/repos/${repo._id}`} className="glass-card-hover block p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {isPrivate ? (
            <FiLock className="text-yellow-500 w-5 h-5" />
          ) : (
            <FiGlobe className="text-brand-400 w-5 h-5" />
          )}
          <h3 className="text-lg font-semibold text-brand-400 hover:underline decoration-brand-400/50 underline-offset-4 truncate max-w-[200px]">
            {repo.owner?.username} / {repo.name}
          </h3>
        </div>
        <span className="badge border border-dark-600 bg-dark-800 text-dark-300 text-xs">
          {isPrivate ? 'Private' : 'Public'}
        </span>
      </div>

      <p className="text-dark-300 text-sm mb-6 line-clamp-2 min-h-[40px]">
        {repo.description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between text-xs text-dark-400 mt-auto pt-4 border-t border-dark-700/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${repo.language ? 'bg-yellow-400' : 'bg-gray-500'}`} />
            <span>{repo.language || 'Multiple'}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiStar className="w-3.5 h-3.5 text-yellow-400" />
            <span>{repo.stars?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiGitPullRequest className="w-3.5 h-3.5 text-blue-400" />
            <span>{repo.forkCount || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <FiClock className="w-3.5 h-3.5" />
          <span>Updated {timeAgo(repo.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
};

export default RepoCard;
