import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { searchUsers } from '../features/users/userSlice';
import { sendFollowRequest, cancelFollowRequest } from '../features/follow/followSlice';
import useDebounce from '../hooks/useDebounce';
import { FiSearch, FiUserPlus, FiUserCheck, FiClock, FiX, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SearchUsersPage = () => {
  const dispatch = useDispatch();
  const { users, total, page, totalPages, loading, error } = useSelector((state) => state.users);
  const currentUser = useSelector((state) => state.auth.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [localFollowState, setLocalFollowState] = useState({}); // userId -> { isFollowing, isPending, requestId }
  
  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    dispatch(searchUsers({ q: debouncedQuery, page: currentPage, limit: 10 }));
  }, [debouncedQuery, currentPage, dispatch]);

  // Sync search results with local follow action states
  useEffect(() => {
    if (users) {
      const states = {};
      users.forEach((u) => {
        states[u._id] = {
          isFollowing: u.isFollowing,
          isPending: u.isPending,
          requestId: u.requestId,
        };
      });
      setLocalFollowState(states);
    }
  }, [users]);

  const handleFollowAction = async (targetUser) => {
    const currentState = localFollowState[targetUser._id] || {};
    
    if (currentState.isFollowing) {
      toast.error('Unfollowing is not implemented yet. Please check again later.');
      return;
    }

    if (currentState.isPending) {
      // Cancel request
      try {
        await dispatch(cancelFollowRequest(currentState.requestId)).unwrap();
        setLocalFollowState((prev) => ({
          ...prev,
          [targetUser._id]: { isFollowing: false, isPending: false, requestId: null },
        }));
        toast.success('Follow request cancelled');
      } catch (err) {
        toast.error(err || 'Failed to cancel follow request');
      }
    } else {
      // Send request
      try {
        const res = await dispatch(sendFollowRequest(targetUser._id)).unwrap();
        setLocalFollowState((prev) => ({
          ...prev,
          [targetUser._id]: { isFollowing: false, isPending: true, requestId: res.request._id },
        }));
        toast.success('Follow request sent');
      } catch (err) {
        toast.error(err || 'Failed to send follow request');
      }
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-4 w-full sm:w-2/3">
            <div className="w-16 h-16 bg-dark-700 rounded-full" />
            <div className="space-y-2 w-full">
              <div className="h-5 bg-dark-700 rounded w-1/3" />
              <div className="h-4 bg-dark-800 rounded w-1/4" />
              <div className="h-4 bg-dark-800 rounded w-1/2" />
            </div>
          </div>
          <div className="h-10 bg-dark-700 rounded w-28" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-8">
        <h1 className="page-title">Search Users</h1>
        <p className="text-dark-400">Discover and follow other developers on CodeForge</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by username or display name..."
          className="input-field pl-12 pr-4 py-3 bg-dark-900 border-dark-700/60 focus:border-brand-500 rounded-xl"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        renderSkeleton()
      ) : users.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <h3 className="text-lg font-medium text-dark-200 mb-2">No users found</h3>
          <p className="text-dark-400 text-sm">Try using different keywords or terms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((u) => {
            const isSelf = currentUser && currentUser._id === u._id;
            const follow = localFollowState[u._id] || {};
            
            return (
              <div key={u._id} className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-dark-600/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Link to={`/profile/${u.username}`} className="block">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.username} className="w-16 h-16 rounded-full object-cover border-2 border-dark-700" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-dark-800 border-2 border-dark-700 flex items-center justify-center font-bold text-xl text-dark-300">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${u.username}`} className="font-bold text-dark-100 hover:text-brand-400 transition-colors">
                        {u.displayName || u.username}
                      </Link>
                      {u.displayName && (
                        <span className="text-sm text-dark-400">@{u.username}</span>
                      )}
                    </div>
                    <p className="text-sm text-dark-300 mt-1 max-w-md line-clamp-2">{u.bio || 'No bio written yet.'}</p>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-dark-400">
                      <span className="flex items-center gap-1">
                        <FiBookOpen className="w-3.5 h-3.5" /> {u.repositoryCount} repositories
                      </span>
                      <span>•</span>
                      <span>{u.followerCount} followers</span>
                    </div>
                  </div>
                </div>

                {!isSelf && (
                  <div className="flex items-center gap-2 self-stretch sm:self-center">
                    <button
                      onClick={() => handleFollowAction(u)}
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                        follow.isFollowing
                          ? 'bg-dark-800 text-dark-200 border border-dark-700'
                          : follow.isPending
                          ? 'bg-dark-900 text-yellow-500 border border-yellow-500/30'
                          : 'bg-brand-600 hover:bg-brand-500 text-white'
                      }`}
                    >
                      {follow.isFollowing ? (
                        <>
                          <FiUserCheck className="w-4 h-4" />
                          <span>Following</span>
                        </>
                      ) : follow.isPending ? (
                        <>
                          <FiClock className="w-4 h-4" />
                          <span>Pending</span>
                        </>
                      ) : (
                        <>
                          <FiUserPlus className="w-4 h-4" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-dark-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchUsersPage;
