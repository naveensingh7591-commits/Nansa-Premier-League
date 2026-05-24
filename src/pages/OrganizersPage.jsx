import React from 'react';
import Organizers from '../components/Organizers';
import { motion } from 'framer-motion';
import { Users, Crown } from 'lucide-react';

const OrganizersPage = () => {
  return (
    <div className="page-content">
      <header className="role-page-header">
        <div className="role-bg-text">VISION</div>
        <Crown className="role-decor-icon" size={300} />
        
        <div className="role-header-content">
          <motion.div 
            className="role-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Users size={16} />
            <span>Architects of NPL</span>
          </motion.div>
          
          <motion.h1 
            className="role-title"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The <span>Organizers</span>
          </motion.h1>
          
          <motion.p 
            className="role-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The dedicated team behind the scenes who turn a shared passion for cricket into the grandest stage for village talent. Visionaries driving the NPL legacy forward.
          </motion.p>
        </div>
      </header>

      <div className="role-page-content" style={{ marginTop: '0' }}>
        <Organizers />
      </div>
    </div>
  );
};

export default OrganizersPage;
