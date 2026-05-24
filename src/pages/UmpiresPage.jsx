import React from 'react';
import Gallery from '../components/Gallery';
import { motion } from 'framer-motion';
import { ShieldCheck, Scale } from 'lucide-react';

const UmpiresPage = () => {
  return (
    <div className="page-content">
      <header className="role-page-header">
        <div className="role-bg-text">DECISION</div>
        <Scale className="role-decor-icon" size={300} />
        
        <div className="role-header-content">
          <motion.div 
            className="role-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ShieldCheck size={16} />
            <span>Guardians of Fair Play</span>
          </motion.div>
          
          <motion.h1 
            className="role-title"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The <span>Umpires</span>
          </motion.h1>
          
          <motion.p 
            className="role-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Maintaining the integrity of every delivery and every decision. Meet the seasoned officials who ensure the spirit of cricket remains at the heart of the NPL.
          </motion.p>
        </div>
      </header>

      <div className="role-page-content">
        <Gallery initialFilter="Umpires" />
      </div>
    </div>
  );
};

export default UmpiresPage;
