import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchFollowing } from '../features/profile/profileSlice';
import useDebounce from '../hooks/useDebounce';
import { FiUsers, FiArrowLeft, FiSearch } from 'react-icons/fi';

const FollowingPage = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { following, followingTotal, followingPage, followingTotalPages, followingLoading } = useSelector((state) => state.profile);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('username');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    dispatch(fetchFollowing({ username, search: debouncedSearch, sort, page, limit: 10 }));
  }, [dispatch, username, debouncedSearch, sort, page]);

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Link to={`/profile/${username}`} className="p-2 text-dark-400 hover:text-dark-200 bg-dark-800 rounded-lg transition-colors">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title flex items-center gap-2 text-2xl">
            <FiUsers className="w-6 h-6 text-brand-500" />
            Following
          </h1>
          <p className="text-dark-400 text-sm">People followed by @{username}</p>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search following users..."
            className="input-field pl-10 pr-4 py-2 bg-dark-900 border-dark-700/60 rounded-lg text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="input-field w-full sm:w-44 bg-dark-900 border-dark-700/60 rounded-lg text-sm px-3 py-2"
        >
          <option value="username">Alphabetical</option>
          <option value="newest">Recently Followed</option>
          <option value="oldest">Older Followers</option>
        </select>
      </div>

      {followingLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-6 h-20 animate-pulse" />
          ))}
        </div>
      ) : following.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FiUsers className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-200 mb-2">Not following anyone</h3>
          <p className="text-dark-400 text-sm">This user hasn't followed anyone matching those criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {following.map((f) => (
            <div key={f._id} className="glass-card p-5 flex items-center justify-between hover:border-dark-600/40 transition-all">
              <div className="flex items-center gap-3">
                <Link to={`/profile/${f.username}`}>
                  {f.avatar ? (
                      <img src={f.avatar} alt={f.username} className="w-12 h-12 rounded-full object-cover border border-dark-700" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center font-bold text-dark-300">
                        {f.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                </Link>
                <div>
                  <Link to={`/profile/${f.username}`} className="font-bold text-dark-100 hover:text-brand-400 text-sm">
                    {f.displayName || f.username}
                  </Link>
                  {f.displayName && <p className="text-xs text-dark-400">@{f.username}</p>}
                  <p className="text-xs text-dark-500 mt-1">{f.followersCount} followers • {f.followingCount} following</p>
                </div>
              </div>

              <Link to={`/profile/${f.username}`} className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-dark-200 rounded-lg text-xs font-semibold">
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {followingTotalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-dark-400">
            Page {page} of {followingTotalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, followingTotalPages))}
            disabled={page === followingTotalPages}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FollowingPage;
