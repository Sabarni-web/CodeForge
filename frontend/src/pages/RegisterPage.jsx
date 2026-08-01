import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../features/auth/authThunks';
import { clearError } from '../features/auth/authSlice';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  // Simple password strength calculation
  const getStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 6) score += 33;
    if (pass.length > 10) score += 33;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 34;
    return score;
  };
  const strength = getStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await dispatch(registerUser(formData)).unwrap();
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err || 'Failed to register');
    }
  };

  return (
    <>
      <h1 className="cf-auth__heading">Create an account.</h1>
      <p className="cf-auth__subheading">Join CodeForge to start building your ideas.</p>

      {error && (
        <div className="w-full p-3 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={`cf-field ${error ? 'is-error' : ''}`}>
          <label className="cf-field__label" htmlFor="username">Username</label>
          <div className="cf-field__wrap">
            <FiUser className="cf-field__icon w-4 h-4" />
            <input
              type="text"
              id="username"
              name="username"
              className="cf-field__input"
              placeholder="Name"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={`cf-field ${error ? 'is-error' : ''}`}>
          <label className="cf-field__label" htmlFor="email">Email Address</label>
          <div className="cf-field__wrap">
            <FiMail className="cf-field__icon w-4 h-4" />
            <input
              type="email"
              id="email"
              name="email"
              className="cf-field__input"
              placeholder="you@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={`cf-field ${error ? 'is-error' : ''}`} style={{ marginBottom: formData.password ? '6px' : '18px' }}>
          <label className="cf-field__label" htmlFor="password">Password</label>
          <div className="cf-field__wrap">
            <FiLock className="cf-field__icon w-4 h-4" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="cf-field__input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <FiEye className="w-4 h-4" />
            </button>
          </div>
          {error && <div className="cf-field__error">{error}</div>}
        </div>

        {formData.password && (
          <div className="cf-strength" style={{ marginBottom: '22px' }}>
            <div className="cf-strength__bar">
              <span style={{ width: strength > 0 ? '100%' : '0%', background: strength > 33 ? 'var(--cf-success)' : 'var(--cf-danger)' }} />
            </div>
            <div className="cf-strength__bar">
              <span style={{ width: strength > 33 ? '100%' : '0%', background: strength > 66 ? 'var(--cf-success)' : '#febc2e' }} />
            </div>
            <div className="cf-strength__bar">
              <span style={{ width: strength > 66 ? '100%' : '0%', background: 'var(--cf-success)' }} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`cf-auth__submit ${loading ? 'is-loading' : ''}`}
        >
          <span className="cf-auth__submit-label">Sign Up</span>
          <span className="cf-spinner"></span>
        </button>
      </form>
    </>
  );
};

export default RegisterPage;
