import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { searchPublicRepositories, clearSearchState } from '../features/repos/repositorySearchSlice';
import Loader from '../components/common/Loader';
import { FiSearch, FiStar, FiBookOpen, FiGlobe, FiFilter, FiGitPullRequest, FiClock } from 'react-icons/fi';
import { timeAgo } from '../utils/dateFormatter';

const RepositorySearchPage = () => {
  const dispatch = useDispatch();
  const { repositories, loading, error, page, totalPages, total } = useSelector(
    (state) => state.repositorySearch
  );

  const [searchParams, setSearchParams] = useState({
    q: '',
    owner: '',
    language: '',
    topics: '',
    sort: 'newest',
  });

  const [appliedParams, setAppliedParams] = useState({
    q: '',
    owner: '',
    language: '',
    topics: '',
    sort: 'newest',
  });

  // Track page inside local state or thunk
  const [currentPage, setCurrentPage] = useState(1);

  // Trigger search on mount and when applied parameters change
  useEffect(() => {
    dispatch(searchPublicRepositories({ ...appliedParams, page: currentPage, limit: 10 }));
  }, [dispatch, appliedParams, currentPage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(clearSearchState());
    setCurrentPage(1);
    setAppliedParams(searchParams);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleClearFilters = () => {
    const cleared = { q: '', owner: '', language: '', topics: '', sort: 'newest' };
    setSearchParams(cleared);
    setAppliedParams(cleared);
    setCurrentPage(1);
    dispatch(clearSearchState());
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-50 flex items-center gap-2">
          <FiSearch className="text-brand-400 w-8 h-8" />
          Explore Repositories
        </h1>
        <p className="text-dark-400 mt-1">Discover public code repositories created by the CodeForge community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <form onSubmit={handleSearchSubmit} className="glass-card p-5 space-y-5">
            <h3 className="font-semibold text-dark-100 flex items-center gap-2 border-b border-dark-700 pb-2">
              <FiFilter className="w-4 h-4 text-brand-400" /> Filters
            </h3>

            <div>
              <label className="input-label" htmlFor="q">Repository Name</label>
              <input
                type="text"
                id="q"
                name="q"
                className="input-field"
                placeholder="e.g. e-commerce"
                value={searchParams.q}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label" htmlFor="owner">Owner Username</label>
              <input
                type="text"
                id="owner"
                name="owner"
                className="input-field"
                placeholder="e.g. sabarni"
                value={searchParams.owner}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label" htmlFor="language">Language</label>
              <input
                type="text"
                id="language"
                name="language"
                className="input-field"
                placeholder="e.g. javascript"
                value={searchParams.language}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label" htmlFor="topics">Topics (comma separated)</label>
              <input
                type="text"
                id="topics"
                name="topics"
                className="input-field"
                placeholder="e.g. react, api"
                value={searchParams.topics}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label" htmlFor="sort">Sort By</label>
              <select
                id="sort"
                name="sort"
                className="input-field"
                value={searchParams.sort}
                onChange={handleInputChange}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="stars">Most Stars</option>
                <option value="forks">Most Forks</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={handleClearFilters}
                className="btn-secondary w-1/2 text-xs"
              >
                Reset
              </button>
              <button 
                type="submit" 
                className="btn-primary w-1/2 text-xs"
              >
                Apply
              </button>
            </div>
          </form>
        </aside>

        {/* Search Results List */}
        <main className="lg:col-span-3 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {repositories.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-dark-400">{total} public repositories found</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repositories.map((repo) => (
                  <Link 
                    key={repo._id} 
                    to={`/repos/${repo._id}`} 
                    className="glass-card-hover block p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FiBookOpen className="text-brand-400 w-5 h-5" />
                        <h3 className="text-base font-bold text-brand-400 hover:underline decoration-brand-400/50 underline-offset-4 line-clamp-1">
                          {repo.owner?.username} / {repo.name}
                        </h3>
                      </div>
                      <span className="badge border border-dark-600 bg-dark-800 text-dark-300 text-xs flex items-center gap-1">
                        <FiGlobe className="w-3 h-3" /> Public
                      </span>
                    </div>

                    <p className="text-dark-300 text-xs line-clamp-2 min-h-[32px]">
                      {repo.description || 'No description provided.'}
                    </p>

                    {repo.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {repo.topics.slice(0, 3).map((topic, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-dark-800 rounded-full text-dark-200">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-dark-400 pt-3 border-t border-dark-700/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${repo.language ? 'bg-yellow-400' : 'bg-gray-500'}`} />
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
                      <div className="flex items-center gap-1 text-dark-500">
                        <FiClock className="w-3 h-3" />
                        <span>{timeAgo(repo.updatedAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More Trigger */}
              {currentPage < totalPages && (
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={handleLoadMore} 
                    disabled={loading}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-dark-300 border-t-transparent rounded-full animate-spin" /> : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            !loading && (
              <div className="glass-card p-16 text-center">
                <h3 className="text-lg font-medium text-dark-200 mb-2">No public repositories found</h3>
                <p className="text-dark-400 text-sm">Try widening your search terms or filters.</p>
              </div>
            )
          )}

          {loading && repositories.length === 0 && (
            <div className="flex justify-center py-12">
              <Loader size="md" text="Searching repositories..." />
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default RepositorySearchPage;
