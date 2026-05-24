import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import trophyImg from '../assets/trophy.png';
import season1Img from '../assets/season1-winner.jpg';
import season2Img from '../assets/season2-winner.jpg';
import season1RunnerImg from '../assets/season1-runnerup.jpg';
import season2RunnerImg from '../assets/season2-runnerup.jpg';

const TournamentOverview = () => {
  const isAdmin = localStorage.getItem('npl_admin') === 'true';
  const [tournamentDate, setTournamentDate] = useState("JANUARY 2027");

  const handleSetDate = () => {
    const newDate = prompt("Enter New Tournament Date (e.g. JANUARY 2027):", tournamentDate);
    if (newDate) setTournamentDate(newDate.toUpperCase());
  };

  const details = [
    { icon: <Calendar />, label: "Month & Year", value: tournamentDate },
    { icon: <MapPin />, label: "Venue", value: "Playground, Junior High School Nansa Bazar" },
    { icon: <Users />, label: "Teams", value: "16 Participating" },
    { icon: <Clock />, label: "Match Timings", value: "9:00 AM onwards" },
  ];

  const milestones = [
    { 
      year: "2026", 
      event: "Season 2", 
      winner: "Moti Mishra 11", 
      runnerUp: "JBA Cricket Club",
      winnerImage: season2Img,
      runnerUpImage: season2RunnerImg
    },
    { 
      year: "2025", 
      event: "Inaugural Season", 
      winner: "Mahmadpur", 
      runnerUp: "Pramod 11",
      winnerImage: season1Img,
      runnerUpImage: season1RunnerImg
    },
  ];

  return (
    <section id="overview" className="overview-section">
      <div className="section-header-flex">
        <h2 className="section-title">Tournament <span>Overview</span></h2>
        {isAdmin && <button className="btn-secondary manage-btn">Manage Schedule</button>}
      </div>
      
      <div className="overview-grid">
        {details.map((detail, index) => (
          <motion.div 
            key={index}
            className="overview-card glass"
            whileHover={{ y: -5, boxShadow: "var(--stadium-glow)" }}
          >
            <div className="card-icon">{detail.icon}</div>
            <div className="card-info">
              <span className="label">{detail.label}</span>
              <span className="value">{detail.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="prize-pool glass">
        <img src={trophyImg} alt="NPL Trophy" className="trophy-display-img" />
        <div className="prize-content">
          <h3>Season Prize Pool</h3>
          <p>₹11,000 + Championship Trophy</p>
          <span className="prev-prize">Previous Year: ₹11,000</span>
        </div>
        <div className="countdown">
          <span className="countdown-label">Season 3 Starts In:</span>
          <div className="timer-placeholder">
            <span className="january-text">{tournamentDate}</span>
            {isAdmin && <button className="manage-timer-btn" onClick={handleSetDate}>Set Date</button>}
          </div>
        </div>
      </div>

      <div className="journey-summary">
        <div className="summary-header">
          <h3>Our <span>Journey</span></h3>
          <p>A legacy of champions and unforgettable moments.</p>
        </div>
        
        <div className="summary-grid">
          {milestones.map((m, i) => (
            <motion.div 
              key={i} 
              className="summary-card glass"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="journey-images-split compact">
                <div className="journey-img-container">
                  <img src={m.winnerImage} alt="Winner" />
                </div>
                <div className="journey-img-container">
                  <img src={m.runnerUpImage} alt="Runner Up" />
                </div>
              </div>
              <div className="year-badge small">{m.year}</div>
              <div className="summary-card-content">
                <h4>{m.event}</h4>
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="stat-label">CHAMPION</span>
                    <span className="stat-value highlight">{m.winner}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">RUNNER UP</span>
                    <span className="stat-value">{m.runnerUp}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TournamentOverview;
