import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase_client';
import { Calendar, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Fixtures = () => {
  const isAdmin = localStorage.getItem('npl_admin') === 'true';
  const [fixturesImg, setFixturesImg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const adminEdited = useRef(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const { data, error } = await supabase
          .from('site_data')
          .select('data')
          .eq('id', 'fixtures')
          .single();
        
        if (data && data.data && data.data.url) {
          setFixturesImg(data.data.url);
        }
      } catch (err) {
        console.error('Failed to load fixtures:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchFixtures();
  }, []);

  useEffect(() => {
    if (isLoaded && adminEdited.current) {
      setSyncStatus('Saving...');
      supabase.from('site_data').upsert({
        id: 'fixtures',
        data: { url: fixturesImg }
      }).then(({ error }) => {
        if (error) {
          console.error('Failed to save fixtures:', error.message);
          setSyncStatus('Failed to save ✗');
        } else {
          setSyncStatus('Saved ✓');
          setTimeout(() => setSyncStatus(''), 2000);
        }
      });
      adminEdited.current = false;
    }
  }, [fixturesImg, isLoaded]);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 1200; 
          
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      const compressedUrl = await compressImage(file);
      setFixturesImg(compressedUrl);
      adminEdited.current = true;
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to remove the fixtures image?')) {
      setFixturesImg(null);
      adminEdited.current = true;
    }
  };

  return (
    <section id="fixtures" className="fixtures-section" style={{ padding: '4rem 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="section-header-flex">
        <h2 className="section-title">Tournament <span>Fixtures</span></h2>
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {syncStatus && <span className="sync-status">{syncStatus}</span>}
            <button 
              className="btn-secondary manage-btn"
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
            >
              <Upload size={16} style={{ marginRight: '8px' }} />
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              onChange={handleFileUpload}
              accept="image/*"
            />
          </div>
        )}
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        
        {fixturesImg ? (
          <div style={{ position: 'relative', width: '100%' }}>
            {isAdmin && (
               <button 
                 onClick={handleDelete}
                 style={{
                   position: 'absolute',
                   top: '10px',
                   right: '10px',
                   background: 'rgba(0,0,0,0.7)',
                   color: 'var(--color-secondary)',
                   border: 'none',
                   borderRadius: '50%',
                   width: '40px',
                   height: '40px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: 'pointer',
                   zIndex: 10
                 }}
                 title="Remove Fixtures"
               >
                 <Trash2 size={20} />
               </button>
            )}
            <img src={fixturesImg} alt="Tournament Fixtures" style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-md)' }} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--color-outline)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Calendar size={64} style={{ opacity: 0.5 }} />
            <h3 style={{ fontSize: '2rem', color: 'var(--color-on-surface)', margin: 0 }}>Uploading Soon...</h3>
            <p>The official match schedule will be posted here once finalized.</p>
          </div>
        )}

      </div>
    </section>
  );
};

export default Fixtures;
