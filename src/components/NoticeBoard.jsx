import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase_client';
import { Edit2, Save, X, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NoticeBoard = () => {
  const isAdmin = localStorage.getItem('npl_admin') === 'true';
  const [notices, setNotices] = useState('Tournament updates will be posted here soon. Stay tuned!');
  const [isEditing, setIsEditing] = useState(false);
  const [tempNotices, setTempNotices] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const adminEdited = useRef(false);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data, error } = await supabase
          .from('site_data')
          .select('data')
          .eq('id', 'notices')
          .single();
        
        if (data && data.data && data.data.text) {
          setNotices(data.data.text);
        }
      } catch (err) {
        console.error('Failed to load notices:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchNotices();
  }, []);

  useEffect(() => {
    if (isLoaded && adminEdited.current) {
      setSyncStatus('Saving...');
      supabase.from('site_data').upsert({
        id: 'notices',
        data: { text: notices }
      }).then(({ error }) => {
        if (error) {
          console.error('Failed to save notices:', error.message);
          setSyncStatus('Failed to save ✗');
        } else {
          setSyncStatus('Saved ✓');
          setTimeout(() => setSyncStatus(''), 2000);
        }
      });
      adminEdited.current = false;
    }
  }, [notices, isLoaded]);

  const handleSave = () => {
    setNotices(tempNotices);
    adminEdited.current = true;
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setTempNotices(notices);
    setIsEditing(true);
  };

  return (
    <section className="notice-board-section" style={{ padding: '4rem 20px', maxWidth: '800px', margin: '0 auto' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass" 
        style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', position: 'relative', border: '1px solid rgba(234, 179, 8, 0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
      >
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Megaphone size={28} color="var(--color-secondary)" />
          </motion.div>
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--color-secondary)' }}>Notice Board</h2>
          
          {isAdmin && !isEditing && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {syncStatus && <span style={{ fontSize: '0.8rem', color: 'var(--color-outline)' }}>{syncStatus}</span>}
              <button onClick={handleEditClick} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                <Edit2 size={14} style={{ marginRight: '6px' }} /> Edit
              </button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div 
              key="edit"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="edit-container"
            >
              <textarea 
                value={tempNotices}
                onChange={(e) => setTempNotices(e.target.value)}
                style={{ 
                  width: '100%', 
                  minHeight: '150px', 
                  background: 'rgba(0,0,0,0.2)', 
                  color: 'white', 
                  border: '1px solid var(--color-secondary)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1rem',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={handleCancel} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  <X size={16} style={{ marginRight: '6px' }} /> Cancel
                </button>
                <button onClick={handleSave} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  <Save size={16} style={{ marginRight: '6px' }} /> Save
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--color-on-surface)', fontSize: '1.1rem' }}
            >
              {notices}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default NoticeBoard;
