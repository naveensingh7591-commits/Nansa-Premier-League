import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, History, Sparkles } from 'lucide-react';
import season1Img from '../assets/season1-winner.jpg';
import season2Img from '../assets/season2-winner.jpg';
import season1RunnerImg from '../assets/season1-runnerup.jpg';
import season2RunnerImg from '../assets/season2-runnerup.jpg';

const SeasonsArchive = () => {
  const seasons = [
    {
      year: "2026",
      title: "Season 2: The Expansion",
      winner: "Moti Mishra 11",
      runnerUp: "JBA Cricket Club",
      description: "A historic season featuring record-breaking crowds and the highest quality of village cricket seen to date.",
      winnerImage: season2Img,
      runnerUpImage: season2RunnerImg
    },
    {
      year: "2025",
      title: "Inaugural Season: The Beginning",
      winner: "Mahmadpur",
      runnerUp: "Pramod 11",
      description: "The spark that started it all. Bringing the community together through the spirit of the game.",
      winnerImage: season1Img,
      runnerUpImage: season1RunnerImg
    }
  ];

  return (
    <section id="seasons" className="journey-section">
      <div className="role-bg-text" style={{ top: '10%' }}>JOURNEY</div>
      
      <div className="section-header-centered">
        <motion.div 
          className="role-badge"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <History size={16} />
          <span>Our Legacy</span>
        </motion.div>
        <h2 className="section-title">The <span>NPL Journey</span></h2>
      </div>

      <div className="journey-timeline">
        <div className="timeline-line"></div>
        
        {seasons.map((season, index) => (
          <motion.div 
            key={index}
            className={`journey-item ${index % 2 === 0 ? 'left' : 'right'}`}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="journey-dot">
              <Sparkles size={12} />
            </div>
            
            <div className="journey-card glass">
              <div className="journey-images-split">
                <div className="journey-img-container">
                  <img src={season.winnerImage} alt="Winner" />
                  <div className="img-label winner">WINNER</div>
                </div>
                <div className="journey-img-container">
                  <img src={season.runnerUpImage} alt="Runner Up" />
                  <div className="img-label runner-up">RUNNER UP</div>
                </div>
                <div className="journey-year-tag">{season.year}</div>
              </div>
              
              <div className="journey-content">
                <h3>{season.title}</h3>
                <p className="journey-desc">{season.description}</p>
                
                <div className="journey-stats">
                  <div className="journey-stat winner">
                    <Trophy size={16} />
                    <span>Winner: <strong>{season.winner}</strong></span>
                  </div>
                  <div className="journey-stat runner-up">
                    <Target size={16} />
                    <span>Runner Up: {season.runnerUp}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SeasonsArchive;
