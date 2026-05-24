import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroBg from '../assets/hero-bg.png';
import { Trophy, Play } from 'lucide-react';

const Hero = () => {
  const marqueeItems = [
    "NPL SEASON 3 COMING SOON",
    "NPL SEASON 3 COMING SOON",
    "NPL SEASON 3 COMING SOON",
    "NPL SEASON 3 COMING SOON",
  ];

  return (
    <div className="hero">
      <img src={heroBg} alt="Stadium" className="hero-bg" />
      <div className="hero-overlay"></div>
      
      <motion.div 
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>NPL <br /> <span>Nansa Premiere League</span></h1>
        <p className="tagline">“Pride of Rule Out Cricket Tournament”</p>
        
        <div className="hero-btns">
          <Link to="/seasons" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Explore Seasons
          </Link>
          <Link to="/gallery" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            View Gallery
          </Link>
        </div>
      </motion.div>

      <div className="marquee-container">
        <div className="marquee">
          <div className="marquee-content">
            {marqueeItems.map((item, index) => (
              <span key={index} className="marquee-item">
                <Trophy size={14} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
