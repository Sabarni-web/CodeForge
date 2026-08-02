import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authThunks';
import { toggleTheme } from '../../features/ui/uiSlice';
import { acceptFollowRequest, rejectFollowRequest } from '../../features/follow/followSlice';
import { markNotificationRead } from '../../features/notifications/notificationSlice';
import { FiCode, FiCpu, FiPlus, FiSun, FiMoon, FiUser, FiLogOut, FiGlobe, FiBell, FiUsers, FiSettings, FiSearch, FiShield } from 'react-icons/fi';
import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import './Navbar.css';

const NAV_ITEMS = [
  { path: '/repos', label: 'Repos', icon: FiCode },
  { path: '/search-repos', label: 'Explore', icon: FiSearch },
  { path: '/ai-generator', label: 'AI Generator', icon: FiCpu },
  { path: '/ai/sites', label: 'My Sites', icon: FiGlobe },
  { path: '/search-users', label: 'Developers', icon: FiUsers },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);
  const { notifications, unreadCount } = useSelector((state) => state.notifications || { notifications: [], unreadCount: 0 });

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const linksRef = useRef(null);

  // Scroll listener for compact mode
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  // Calculate indicator position
  const getIndicatorStyle = useCallback(() => {
    if (!linksRef.current) return { width: 0, transform: 'translateX(0px)' };
    const links = linksRef.current.querySelectorAll('.cf-navbar__link');
    let activeIdx = -1;
    links.forEach((el, i) => {
      if (el.classList.contains('is-active')) activeIdx = i;
    });
    if (activeIdx === -1) return { width: 0, transform: 'translateX(0px)', opacity: 0 };

    const activeLink = links[activeIdx];
    const containerRect = linksRef.current.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const offset = linkRect.left - containerRect.left - 4; // 4px padding
    return { width: `${linkRect.width}px`, transform: `translateX(${offset}px)`, opacity: 1 };
  }, [location.pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await dispatch(logoutUser());
    navigate('/login');
  };

  const getRequestId = (link) => {
    if (!link) return null;
    const match = link.match(/[?&]requestId=([^&]+)/);
    return match ? match[1] : null;
  };

  const handleAcceptFollow = async (requestId, notificationId) => {
    try {
      await dispatch(acceptFollowRequest(requestId)).unwrap();
      toast.success('Follow request accepted');
      await dispatch(markNotificationRead(notificationId)).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to accept follow request');
    }
  };

  const handleRejectFollow = async (requestId, notificationId) => {
    try {
      await dispatch(rejectFollowRequest(requestId)).unwrap();
      toast.success('Follow request rejected');
      await dispatch(markNotificationRead(notificationId)).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to reject follow request');
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className={`cf-navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="cf-navbar__inner">
        {/* Brand */}
        <Link to="/" className="cf-navbar__brand">
          <span className="cf-navbar__mark">{"<>"}</span>
          CodeForge
        </Link>

        {/* Center nav links (authenticated only) */}
        {isAuthenticated && (
          <div className="cf-navbar__links" ref={linksRef}>
            <div className="cf-navbar__indicator" style={getIndicatorStyle()} />
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`cf-navbar__link ${isActive(item.path) ? 'is-active' : ''}`}
              >
                <item.icon />
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right cluster */}
        <div className="cf-navbar__right">
          {/* Theme toggle */}
          <button
            className={`cf-theme-toggle ${theme === 'dark' ? 'is-dark' : ''}`}
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle theme"
          >
            <span className="cf-theme-toggle__thumb">
              {theme === 'dark' ? <FiMoon /> : <FiSun />}
            </span>
          </button>

          {isAuthenticated ? (
            <>
              {/* New repo CTA */}
              <Link to="/repos/new" className="cf-navbar__cta">
                <FiPlus />
                <span className="cf-label-text">New</span>
              </Link>

              {/* Search Icon */}
              <Link to="/search-users" className="p-2 text-dark-300 hover:text-white transition-colors mr-2" aria-label="Search Users">
                <FiSearch className="w-5 h-5" />
              </Link>

              {/* Verify Code Icon */}
              <Link to="/guardian/verify" className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors mr-2" aria-label="Verify Code">
                <FiShield className="w-5 h-5" />
              </Link>

              {/* Notifications Icon with Badge */}
              <div className="relative cf-notif-wrap" ref={notifDropdownRef}>
                <button 
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-dark-300 hover:text-white transition-colors mr-2" 
                  aria-label="Notifications"
                >
                  <FiBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-550 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {notifDropdownOpen && (
                  <div className="cf-notifications-dropdown">
                    <div className="cf-notifications-header">
                      <span className="font-semibold text-white">Notifications</span>
                    </div>
                    <div className="cf-notifications-body">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-dark-400">No new notifications</div>
                      ) : (
                        notifications.slice(0, 5).map(n => {
                          const requestId = getRequestId(n.link);
                          return (
                            <div key={n._id} className={`cf-notif-item ${!n.isRead ? 'is-unread' : ''}`}>
                              <div className="cf-notif-msg text-sm text-dark-300">
                                <Link to={n.link} onClick={() => setNotifDropdownOpen(false)} className="text-dark-100 hover:text-brand-400 font-medium">
                                  {n.sender?.displayName || n.sender?.username}
                                </Link>{' '}
                                {n.message.replace(`${n.sender?.username}`, '').replace(`${n.sender?.displayName}`, '').trim()}
                              </div>
                              {n.type === 'FOLLOW_REQUEST' && !n.isRead && requestId && (
                                <div className="cf-notif-actions mt-2 flex gap-2">
                                  <button onClick={() => handleAcceptFollow(requestId, n._id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs transition-colors font-medium">Accept</button>
                                  <button onClick={() => handleRejectFollow(requestId, n._id)} className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded text-xs transition-colors font-medium">Decline</button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                    <Link to="/notifications" onClick={() => setNotifDropdownOpen(false)} className="cf-notifications-footer hover:text-brand-400 text-sm text-center block w-full py-3 border-t border-dark-700 text-dark-200 transition-colors">
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* Avatar + dropdown */}
              <div className={`cf-avatar-wrap ${dropdownOpen ? 'is-open' : ''}`} ref={dropdownRef}>
                <button className="cf-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <span className="cf-avatar__circle">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  <span className="cf-avatar__name">{user?.username}</span>
                  <svg className="cf-avatar__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <div className="cf-dropdown">
                  <Link to={`/profile/${user?.username}`} className="cf-dropdown__item">
                    <FiUser /> Profile
                  </Link>
                  <Link to={`/profile/${user?.username}/followers`} className="cf-dropdown__item">
                    <FiUsers /> Followers
                  </Link>
                  <Link to={`/profile/${user?.username}/following`} className="cf-dropdown__item">
                    <FiUsers /> Following
                  </Link>
                  <Link to="/notifications" className="cf-dropdown__item">
                    <FiBell /> Notifications
                  </Link>
                  <Link to="/profile" className="cf-dropdown__item">
                    <FiSettings /> Settings
                  </Link>
                  <div className="cf-dropdown__divider" />
                  <button onClick={handleLogout} className="cf-dropdown__item is-danger">
                    <FiLogOut /> Sign Out
                  </button>
                </div>
              </div>

              {/* Mobile burger */}
              <button
                className={`cf-navbar__burger ${menuOpen ? 'is-open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <span /><span /><span />
              </button>
            </>
          ) : (
            <div className="cf-navbar__auth-links">
              <Link to="/login" className="cf-navbar__sign-in">Sign In</Link>
              <Link to="/register" className="cf-navbar__sign-up">Sign Up</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile panel */}
      {isAuthenticated && (
        <div className={`cf-navbar__mobile-panel ${menuOpen ? 'is-open' : ''}`}>
          <div className="cf-navbar__mobile-panel-inner">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`cf-navbar__mobile-link ${isActive(item.path) ? 'is-active' : ''}`}
              >
                <item.icon />
                {item.label}
              </Link>
            ))}
            <Link to="/search-users" className={`cf-navbar__mobile-link ${isActive('/search-users') ? 'is-active' : ''}`}>
              <FiSearch />
              Search Users
            </Link>
            <Link to="/guardian/verify" className={`cf-navbar__mobile-link text-emerald-400 ${isActive('/guardian/verify') ? 'is-active' : ''}`}>
              <FiShield />
              Verify Code
            </Link>
            <Link to="/profile" className={`cf-navbar__mobile-link ${isActive('/profile') ? 'is-active' : ''}`}>
              <FiUser />
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
