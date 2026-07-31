import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authThunks';
import { toggleTheme } from '../../features/ui/uiSlice';
import { FiCode, FiCpu, FiPlus, FiSun, FiMoon, FiUser, FiLogOut, FiGlobe, FiBell, FiUsers, FiSettings, FiSearch } from 'react-icons/fi';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const { unreadCount } = useSelector((state) => state.notifications || { unreadCount: 0 });

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
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
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
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

              {/* Notifications Icon with Badge */}
              <Link to="/notifications" className="relative p-2 text-dark-300 hover:text-white transition-colors mr-2" aria-label="Notifications">
                <FiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-550 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>

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
