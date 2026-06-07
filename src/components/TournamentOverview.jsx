import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, X, Edit3 } from 'lucide-react';
import { supabase } from '../supabase_client';
import trophyImg from '../assets/trophy.png';
import season1Img from '../assets/season1-winner.jpg';
import season2Img from '../assets/season2-winner.jpg';
import season1RunnerImg from '../assets/season1-runnerup.jpg';
import season2RunnerImg from '../assets/season2-runnerup.jpg';

const TournamentOverview = () => {
  const isAdmin = localStorage.getItem('npl_admin') === 'true';
  const [tournamentDate, setTournamentDate] = useState("2 JANUARY 2026");
  const [venue, setVenue] = useState("Playground, Junior High School Nansa Bazar");
  const [teamsCount, setTeamsCount] = useState("16 Participating");
  const [timings, setTimings] = useState("9:00 AM onwards");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isManagingSchedule, setIsManagingSchedule] = useState(false);
  const [tempSchedule, setTempSchedule] = useState({ venue: '', teamsCount: '', timings: '', tournamentDate: '' });

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const { data } = await supabase.from('site_data').select('data').eq('id', 'schedule').single();
        if (data && data.data) {
          if (data.data.venue) setVenue(data.data.venue);
          if (data.data.teamsCount) setTeamsCount(data.data.teamsCount);
          if (data.data.timings) setTimings(data.data.timings);
          if (data.data.tournamentDate) setTournamentDate(data.data.tournamentDate);
        }
      } catch (err) {
        console.error("Failed to load schedule:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSchedule();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      supabase.from('site_data').upsert({
        id: 'schedule',
        data: { venue, teamsCount, timings, tournamentDate }
      }).then();
    }
  }, [venue, teamsCount, timings, tournamentDate, isLoaded]);

  const handleSetDate = () => {
    const newDate = prompt("Enter New Tournament Date (e.g. 2 JANUARY 2026):", tournamentDate);
    if (newDate) setTournamentDate(newDate.toUpperCase());
  };

  const details = [
    { icon: <Calendar />, label: "Month & Year", value: tournamentDate },
    { icon: <MapPin />, label: "Venue", value: venue },
    { icon: <Users />, label: "Teams", value: teamsCount },
    { icon: <Clock />, label: "Match Timings", value: timings },
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
        {isAdmin && (
          <button 
            className="btn-secondary manage-btn"
            onClick={() => {
              setTempSchedule({ venue, teamsCount, timings, tournamentDate });
              setIsManagingSchedule(true);
            }}
          >
            <Edit3 size={14} style={{ marginRight: '8px' }} />
            Manage Schedule
          </button>
        )}
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

      <AnimatePresence>
        {isManagingSchedule && (
          <motion.div 
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsManagingSchedule(false)}
          >
            <button className="close-btn" onClick={() => setIsManagingSchedule(false)}><X size={32} /></button>
            <motion.div 
              className="manage-modal glass"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '500px', width: '95%' }}
            >
              <div className="modal-header">
                <h3><Calendar size={20} /> Manage Tournament Schedule</h3>
                <p>Update start date, venue, team count, and timings.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setVenue(tempSchedule.venue);
                setTeamsCount(tempSchedule.teamsCount);
                setTimings(tempSchedule.timings);
                setTournamentDate(tempSchedule.tournamentDate.toUpperCase());
                setIsManagingSchedule(false);
              }} className="upload-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Date (e.g. 2 JANUARY 2026)</label>
                  <input 
                    type="text" 
                    value={tempSchedule.tournamentDate}
                    onChange={(e) => setTempSchedule({...tempSchedule, tournamentDate: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Venue</label>
                  <input 
                    type="text" 
                    value={tempSchedule.venue}
                    onChange={(e) => setTempSchedule({...tempSchedule, venue: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Teams Count (e.g. 16 Participating)</label>
                  <input 
                    type="text" 
                    value={tempSchedule.teamsCount}
                    onChange={(e) => setTempSchedule({...tempSchedule, teamsCount: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Match Timings (e.g. 9:00 AM onwards)</label>
                  <input 
                    type="text" 
                    value={tempSchedule.timings}
                    onChange={(e) => setTempSchedule({...tempSchedule, timings: e.target.value})}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    type="button"
                    className="btn-secondary" 
                    style={{ flex: 1 }}
                    onClick={() => setIsManagingSchedule(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ flex: 1, boxShadow: 'none' }}
                  >
                    Save Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TournamentOverview;
