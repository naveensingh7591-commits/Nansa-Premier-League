import React, { useEffect, useState } from 'react';
import { Home, Calendar, Image as ImageIcon, Info, Gavel, Mic2, ClipboardEdit, Sun, Moon, Menu, X, Lock, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isLightMode, setIsLightMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = localStorage.getItem('npl_admin') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('npl_admin');
    window.location.reload();
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('npl_theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.documentElement.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('npl_theme', 'dark');
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('npl_theme', 'light');
      setIsLightMode(true);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Seasons', path: '/seasons' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Umpires', path: '/umpires' },
    { name: 'Commentators', path: '/commentators' },
    { name: 'Scorers', path: '/scorers' },
    { name: 'Organizers', path: '/organizers' },
  ];

  return (
    <nav className={`navbar glass ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
          <span className="logo-text">NPL</span>
          <span className="logo-accent">Nansa Premiere League</span>
        </Link>
        
        <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span>{link.name}</span>
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          {isAdmin ? (
            <button className="btn-admin-logout" onClick={handleLogout} title="Logout Admin">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          ) : (
            <Link to="/admin" className="btn-admin-login" title="Admin Login">
              <Lock size={16} />
            </Link>
          )}
          <a href="https://wa.me/918090964913" target="_blank" rel="noopener noreferrer" className="btn-secondary join-btn" style={{ textDecoration: 'none' }}>
            Join NPL
          </a>
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
