import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchFollowers } from '../features/profile/profileSlice';
import { sendFollowRequest } from '../features/follow/followSlice';
import useDebounce from '../hooks/useDebounce';
import { FiUsers, FiUserCheck, FiArrowLeft, FiUserPlus, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FollowersPage = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { followers, followersTotalPages, followersLoading } = useSelector((state) => state.profile);
  const currentUser = useSelector((state) => state.auth.user);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('username');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    dispatch(fetchFollowers({ username, search: debouncedSearch, sort, page, limit: 10 }));
  }, [dispatch, username, debouncedSearch, sort, page]);

  const handleFollowBack = async (userId) => {
    try {
      await dispatch(sendFollowRequest(userId)).unwrap();
      toast.success('Follow request sent');
      // Refresh list to update states if needed
      dispatch(fetchFollowers({ username, search: debouncedSearch, sort, page, limit: 10 }));
    } catch (err) {
      toast.error(err || 'Failed to send follow request');
    }
  };

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Link to={`/profile/${username}`} className="p-2 text-dark-400 hover:text-dark-200 bg-dark-800 rounded-lg transition-colors">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title flex items-center gap-2 text-2xl">
            <FiUsers className="w-6 h-6 text-brand-500" />
            Followers
          </h1>
          <p className="text-dark-400 text-sm">People following @{username}</p>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search followers..."
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

      {followersLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-6 h-20 animate-pulse flex items-center justify-between" />
          ))}
        </div>
      ) : followers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FiUsers className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-200 mb-2">No followers</h3>
          <p className="text-dark-400 text-sm">Nobody is following this user yet matching those criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followers.map((f) => {
            const isSelf = currentUser && currentUser._id === f._id;
            return (
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
                    {f.mutualCount > 0 && (
                      <p className="text-xs text-brand-400/80 mt-0.5">{f.mutualCount} mutual followers</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/profile/${f.username}`} className="px-2.5 py-1.5 bg-dark-800 hover:bg-dark-700 text-dark-200 rounded-lg text-xs font-semibold">
                    View Profile
                  </Link>
                  {!isSelf && !f.isFollowingBack && (
                    <button
                      onClick={() => handleFollowBack(f._id)}
                      className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <FiUserPlus className="w-3.5 h-3.5" /> Follow Back
                    </button>
                  )}
                  {!isSelf && f.isFollowingBack && (
                    <span className="text-xs text-dark-400 flex items-center gap-1 bg-dark-900 px-2 py-1 rounded">
                      <FiUserCheck className="text-green-500" /> Mutual
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {followersTotalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-dark-400">
            Page {page} of {followersTotalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, followersTotalPages))}
            disabled={page === followersTotalPages}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FollowersPage;
