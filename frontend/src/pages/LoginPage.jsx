import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../features/auth/authThunks';
import { clearError } from '../features/auth/authSlice';
import { FiMail, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await dispatch(loginUser(formData)).unwrap();
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err || 'Failed to login');
    }
  };

  return (
    <>
      <h1 className="cf-auth__heading">Welcome back.</h1>
      <p className="cf-auth__subheading">Sign in to manage your repositories and generate sites.</p>

      {error && (
        <div className="w-full p-3 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={`cf-field ${error ? 'is-error' : ''}`}>
          <label className="cf-field__label" htmlFor="email">Email Address</label>
          <div className="cf-field__wrap">
            <FiMail className="cf-field__icon w-4 h-4" />
            <input
              type="email"
              id="email"
              name="email"
              className="cf-field__input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={`cf-field ${error ? 'is-error' : ''}`}>
          <label className="cf-field__label" htmlFor="password">Password</label>
          <div className="cf-field__wrap">
            <FiLock className="cf-field__icon w-4 h-4" />
            <input
              type="password"
              id="password"
              name="password"
              className="cf-field__input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          {error && <div className="cf-field__error">{error}</div>}
        </div>

        <div className="cf-auth__row">
          <label className="cf-checkbox">
            <input type="checkbox" />
            Remember me
          </label>
          <a href="#" className="cf-link">Forgot password?</a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`cf-auth__submit ${loading ? 'is-loading' : ''}`}
        >
          <span className="cf-auth__submit-label">Sign In</span>
          <span className="cf-spinner"></span>
        </button>
      </form>
    </>
  );
};

export default LoginPage;
