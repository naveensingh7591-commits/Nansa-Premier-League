import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import tributePoster from '../assets/tribute-poster.jpg';

const Tribute = () => {
  const isAdmin = localStorage.getItem('npl_admin') === 'true';
  const [tributeImg, setTributeImg] = React.useState(tributePoster);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTributeImg(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="tribute-section">
      <motion.div 
        className="tribute-container glass"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="tribute-content">
          <div className="tribute-badge">In Loving Memory</div>
          <div className={`tribute-image-frame full-poster ${isAdmin ? 'clickable-tribute' : ''}`}>
            {isAdmin && <input type="file" hidden id="tribute-upload" onChange={handleUpload} accept="image/*" />}
            <label htmlFor={isAdmin ? "tribute-upload" : undefined} className="tribute-upload-label">
              {tributeImg ? (
                <img src={tributeImg} alt="Late Chandrabhan Singh Ji Tribute" className="tribute-photo-full" />
              ) : (
                <div className="tribute-placeholder">
                  {!tributeImg && <Camera size={48} />}
                  <span>{tributeImg ? '' : (isAdmin ? 'Click to Upload Tribute Photo' : '')}</span>
                </div>
              )}
            </label>
            {tributeImg && isAdmin && (
              <label htmlFor="tribute-upload" className="change-tribute-overlay">
                <Camera size={24} />
                <span>Change Photo</span>
              </label>
            )}
          </div>
          <div className="tribute-text">
            <div className="text-garland">🪷 🌸 🌺 🌼 🌺 🌸 🪷</div>
            <h2>Late Chandrabhan Singh Ji</h2>
            <p className="tribute-message">
              "This event is organized in the sacred and loving memory of Late Chandrabhan Singh Ji, 
              whose vision and blessings continue to inspire the Nansa Premiere League."
            </p>
            <div className="tribute-divider"></div>
            <p className="hindi-tribute">आदरणीय स्व. बाबा चन्द्रभान सिंह जी की पुण्य स्मृति में</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Tribute;
