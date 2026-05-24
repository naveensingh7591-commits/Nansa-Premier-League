import React from 'react';
import { motion } from 'framer-motion';
import { Mic2, Gavel, ClipboardEdit, Edit3 } from 'lucide-react';

import buntyImg from '../assets/bunty-singh.jpg';
import pramodImg from '../assets/pramod-lefty.jpg';

const Officials = () => {
  const isAdmin = localStorage.getItem('npl_admin') === 'true';
  const umpires = [
    { name: "Bunty Singh", role: "Official Umpire", img: buntyImg },
    { name: "Pramod Lefty", role: "Official Umpire", img: pramodImg },
    { name: "Ramesh Yadav", role: "Official Umpire", img: null },
  ];

  const commentators = [
    { name: "Rahul Singh", role: "Lead Commentator", img: null },
    { name: "Amit Srivastava", role: "Expert Analyst", img: null },
  ];

  const scorers = [
    { name: "Anuj Singh", role: "Official Scorer", img: null },
    { name: "Deepak Yadav", role: "Official Scorer", img: null }
  ];

  return (
    <section id="officials" className="officials-section">
      <div className="section-header-flex">
        <h2 className="section-title">Official <span>Umpires</span></h2>
        {isAdmin && (
          <button className="btn-secondary manage-btn">
            <Edit3 size={14} style={{ marginRight: '8px' }} />
            Manage Umpires
          </button>
        )}
      </div>

      <div className="officials-grid">
        {/* Umpires */}
        <div className="official-category glass" style={{ gridColumn: '1 / -1' }}>
          <div className="cat-header">
            <Gavel size={24} color="var(--color-tertiary)" />
            <h3>NPL Umpires</h3>
          </div>
          <div className="official-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {umpires.map((u, i) => (
              <div key={i} className="official-item">
                <div className="official-avatar">
                  {u.img ? <img src={u.img} alt={u.name} /> : <div className="avatar-placeholder">{u.name[0]}</div>}
                </div>
                <div className="official-info">
                  <p className="name">{u.name}</p>
                  <p className="role">{u.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Officials;
