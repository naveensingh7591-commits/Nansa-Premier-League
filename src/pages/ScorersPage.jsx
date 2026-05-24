import React from 'react';
import Gallery from '../components/Gallery';
import { motion } from 'framer-motion';
import { ClipboardList, PenTool } from 'lucide-react';

const ScorersPage = () => {
  return (
    <div className="page-content">
      <header className="role-page-header">
        <div className="role-bg-text">STATS</div>
        <ClipboardList className="role-decor-icon" size={300} />
        
        <div className="role-header-content">
          <motion.div 
            className="role-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PenTool size={16} />
            <span>Keepers of History</span>
          </motion.div>
          
          <motion.h1 
            className="role-title"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The <span>Scorers</span>
          </motion.h1>
          
          <motion.p 
            className="role-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Meticulously tracking every run, every ball, and every milestone. Meet the precision team that documents the legendary feats of the Nansa Premier League.
          </motion.p>
        </div>
      </header>

      <div className="role-page-content">
        <Gallery initialFilter="Scorers" />
      </div>
    </div>
  );
};

export default ScorersPage;
