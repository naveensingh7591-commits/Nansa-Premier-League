import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

// SHA-256 hash of the password "naveen@7591"
const ADMIN_USERNAME = 'naveen7591';
const ADMIN_PASSWORD_HASH = '6a301316ac00ffa857b033694977eba748471e902c4e33972d22a2d0d146a29b';

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const isAdmin = localStorage.getItem('npl_admin') === 'true';

  useEffect(() => {
    if (isAdmin) {
      // Already logged in — show logout option
    }
  }, [isAdmin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Small delay to feel natural
    await new Promise(r => setTimeout(r, 600));

    const inputHash = await sha256(password);

    if (username === ADMIN_USERNAME && inputHash === ADMIN_PASSWORD_HASH) {
      setSuccess(true);
      localStorage.setItem('npl_admin', 'true');
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 800);
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('npl_admin');
    window.location.reload();
  };

  if (isAdmin) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card glass">
          <div className="admin-login-header">
            <div className="admin-icon-wrapper logged-in">
              <CheckCircle size={40} />
            </div>
            <h2>Admin Panel Active</h2>
            <p className="admin-subtitle">You are currently logged in as administrator.</p>
          </div>
          <div className="admin-login-actions">
            <button className="btn-primary admin-btn" onClick={() => navigate('/')}>
              Go to Dashboard
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card glass">
        <div className="admin-login-header">
          <div className={`admin-icon-wrapper ${success ? 'logged-in' : ''}`}>
            {success ? <CheckCircle size={40} /> : <Shield size={40} />}
          </div>
          <h2>{success ? 'Welcome Back!' : 'Admin Login'}</h2>
          <p className="admin-subtitle">
            {success ? 'Redirecting to dashboard...' : 'Enter your credentials to access admin features'}
          </p>
        </div>

        {!success && (
          <form onSubmit={handleLogin} className="admin-login-form">
            {error && (
              <div className="admin-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="admin-input-group">
              <label htmlFor="admin-username">Username</label>
              <input
                id="admin-username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="admin-input-group">
              <label htmlFor="admin-password">Password</label>
              <div className="admin-password-wrapper">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="admin-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary admin-btn" disabled={loading}>
              {loading ? (
                <span className="admin-loading">
                  <span className="admin-spinner"></span>
                  Verifying...
                </span>
              ) : (
                <span className="admin-btn-content">
                  <LogIn size={18} />
                  Sign In
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
