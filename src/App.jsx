import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OrganizersPage from './pages/OrganizersPage';
import SeasonsPage from './pages/SeasonsPage';
import GalleryPage from './pages/GalleryPage';
import UmpiresPage from './pages/UmpiresPage';
import CommentatorsPage from './pages/CommentatorsPage';
import ScorersPage from './pages/ScorersPage';
import AdminLogin from './pages/AdminLogin';
import { supabase } from './supabase_client';
import './index.css';



function App() {
  React.useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from('site_data').select('*').limit(1);
      if (error) console.error('Supabase Connection Error:', error.message);
      else console.log('✅ Supabase Connected Successfully!');
    };
    testConnection();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <div className="stadium-lighting"></div>
        <div className="particles-container">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>

        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/seasons" element={<SeasonsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/organizers" element={<OrganizersPage />} />
            <Route path="/umpires" element={<UmpiresPage />} />
            <Route path="/commentators" element={<CommentatorsPage />} />
            <Route path="/scorers" element={<ScorersPage />} />
            <Route path="/admin" element={<AdminLogin />} />
          </Routes>
        </main>
        <footer className="glass footer-section">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="logo-text large">NPL</span>
              <p className="footer-tagline">Pride of Rule Out Cricket Tournament</p>
            </div>
            <div className="footer-socials">
              <a href="https://www.facebook.com/share/1Cehww4uij/" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                <span>Facebook</span>
              </a>
              <a href="https://wa.me/918090964913" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Nansa Premiere League (NPL). All Rights Reserved.</p>
            <div className="developer-tag">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code-2"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
              <span>Designed & Developed by <a href="https://www.linkedin.com/in/utkarsh-singh-2b0279387/" target="_blank" rel="noopener noreferrer" className="dev-link"><strong className="dev-name">UTKARSH SINGH</strong></a></span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
