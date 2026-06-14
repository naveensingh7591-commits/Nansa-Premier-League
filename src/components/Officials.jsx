import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic2, Gavel, ClipboardEdit, Edit3, X, Upload, Trash2, Plus, Camera } from 'lucide-react';
import { supabase } from '../supabase_client';
import { initialGalleryItems } from '../utils/initialGallery';

import buntyImg from '../assets/bunty-singh.jpg';
import pramodImg from '../assets/pramod-lefty.jpg';

const Officials = () => {
  const isAdmin = localStorage.getItem('npl_admin') === 'true';

  const [umpiresList, setUmpiresList] = useState([
    { id: 'u1', name: "Bunty Singh", role: "Official Umpire", image: buntyImg },
    { id: 'u2', name: "Pramod Lefty", role: "Official Umpire", image: pramodImg },
    { id: 'u3', name: "Ramesh Yadav", role: "Official Umpire", image: null },
  ]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isManagingUmpires, setIsManagingUmpires] = useState(false);
  const [tempUmpires, setTempUmpires] = useState([]);
  const [managingPhoto, setManagingPhoto] = useState(null); // { id, name, image }
  const [manualUrl, setManualUrl] = useState('');
  const adminEdited = useRef(false);

  // Load from Supabase on mount
  useEffect(() => {
    const loadUmpires = async () => {
      try {
        const { data } = await supabase.from('site_data').select('data').eq('id', 'umpires').single();
        if (data && data.data) {
          setUmpiresList(data.data);
        }
      } catch (err) {
        console.error("Failed to load umpires from Supabase:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadUmpires();
  }, []);

  // Sync back to Supabase ONLY when admin has explicitly made changes
  useEffect(() => {
    if (isLoaded && adminEdited.current) {
      supabase.from('site_data').upsert({
        id: 'umpires',
        data: umpiresList
      }).then(({ error }) => {
        if (error) console.error('Failed to save umpires:', error.message);
      });
    }
  }, [umpiresList, isLoaded]);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 400; // Avatar sized
          
          if (width > height) {
            if (width > max_size) { height *= max_size / width; width = max_size; }
          } else {
            if (height > max_size) { width *= max_size / height; height = max_size; }
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

  const addToGallery = async (imageUrl, name, role) => {
    try {
      const { data } = await supabase.from('site_data').select('data').eq('id', 'gallery').single();
      let galleryItems = (data && data.data && data.data.length > 0) ? data.data : initialGalleryItems;
      
      const title = `${name} - ${role}`;
      const newItem = {
        id: Date.now(),
        type: 'image',
        category: 'Umpires',
        url: imageUrl,
        title: title
      };
      
      galleryItems = galleryItems.filter(item => !(item.category === 'Umpires' && item.title === title));
      galleryItems = [newItem, ...galleryItems];
      await supabase.from('site_data').upsert({ id: 'gallery', data: galleryItems });
      
      const db = await new Promise((resolve) => {
        const req = indexedDB.open('NPL_Portal_DB', 1);
        req.onsuccess = (e) => resolve(e.target.result);
      });
      const tx = db.transaction('gallery_items', 'readwrite');
      tx.objectStore('gallery_items').put(galleryItems, 'current_items');
    } catch (err) {
      console.error("Failed to sync umpire photo to gallery", err);
    }
  };

  const updateUmpireImage = (id, imageUrl) => {
    const updateFn = (list) => list.map(item => item.id === id ? { ...item, image: imageUrl } : item);
    const umpire = umpiresList.find(u => u.id === id);
    if (imageUrl && umpire) addToGallery(imageUrl, umpire.name, umpire.role || 'Official Umpire');
    adminEdited.current = true;
    setUmpiresList(updateFn);
  };

  const handleImageUpload = async (id, e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const compressedUrl = await compressImage(file);
      updateUmpireImage(id, compressedUrl);
      if (managingPhoto) {
        setManagingPhoto(prev => ({ ...prev, image: compressedUrl }));
      }
    }
  };

  const PhotoPlaceholder = ({ u }) => (
    <div 
      className={`photo-placeholder ${isAdmin ? 'clickable' : ''}`} 
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-neutral)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-secondary)', gap: '0.25rem' }}
      onClick={() => {
        if (isAdmin) {
          setManagingPhoto({ id: u.id, name: u.name, image: u.image });
          setManualUrl(u.image || '');
        }
      }}
    >
      {isAdmin && <Camera size={20} />}
      <span>{isAdmin ? 'Add Photo' : u.name[0]}</span>
    </div>
  );

  return (
    <section id="officials" className="officials-section">
      <div className="section-header-flex">
        <h2 className="section-title">Official <span>Umpires</span></h2>
        {isAdmin && (
          <button 
            className="btn-secondary manage-btn"
            onClick={() => {
              setTempUmpires([...umpiresList]);
              setIsManagingUmpires(true);
            }}
          >
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
            {umpiresList.map((u) => (
              <div key={u.id} className="official-item">
                <div className="official-avatar" style={{ position: 'relative' }}>
                  {u.image ? (
                    <div className="img-wrapper" style={{ width: '100%', height: '100%' }}>
                      <img src={u.image} alt={u.name} />
                      {isAdmin && (
                        <div 
                          className="change-photo-overlay"
                          onClick={() => {
                            setManagingPhoto({ id: u.id, name: u.name, image: u.image });
                            setManualUrl(u.image || '');
                          }}
                        >
                          <Camera size={16} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <PhotoPlaceholder u={u} />
                  )}
                </div>
                <div className="official-info">
                  <p className="name">{u.name}</p>
                  <p className="role">{u.role || 'Official Umpire'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manage Umpires Modal */}
      <AnimatePresence>
        {isManagingUmpires && (
          <motion.div 
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsManagingUmpires(false)}
          >
            <button className="close-btn" onClick={() => setIsManagingUmpires(false)}><X size={32} /></button>
            <motion.div 
              className="manage-modal glass"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '600px', width: '90%' }}
            >
              <div className="modal-header">
                <h3><Edit3 size={20} style={{ marginRight: '8px' }} /> Manage Umpires</h3>
                <p>Add, edit, or remove NPL tournament umpires.</p>
              </div>

              <div className="upload-form" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tempUmpires.map((ump, idx) => (
                  <div key={ump.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: 'var(--radius-default)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        value={ump.name}
                        onChange={(e) => {
                          const updated = [...tempUmpires];
                          updated[idx].name = e.target.value;
                          setTempUmpires(updated);
                        }}
                        placeholder="Umpire Name"
                        required
                        style={{ width: '100%' }}
                      />
                      <input 
                        type="text" 
                        value={ump.role || ''}
                        onChange={(e) => {
                          const updated = [...tempUmpires];
                          updated[idx].role = e.target.value;
                          setTempUmpires(updated);
                        }}
                        placeholder="Role (e.g. Official Umpire)"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => {
                        setTempUmpires(tempUmpires.filter(item => item.id !== ump.id));
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {tempUmpires.length === 0 && (
                  <p style={{ textAlign: 'center', opacity: 0.5, margin: '2rem 0' }}>No umpires added yet.</p>
                )}

                <button 
                  type="button" 
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                  onClick={() => {
                    setTempUmpires([...tempUmpires, { id: 'ump_' + Date.now(), name: '', role: 'Official Umpire', image: null }]);
                  }}
                >
                  <Plus size={16} />
                  Add Umpire
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button"
                  className="btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setIsManagingUmpires(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn-primary" 
                  style={{ flex: 1, boxShadow: 'none' }}
                  onClick={() => {
                    adminEdited.current = true;
                    setUmpiresList(tempUmpires);
                    setIsManagingUmpires(false);
                  }}
                >
                  Save Umpires
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Umpire Photo Manager Modal */}
      <AnimatePresence>
        {managingPhoto && (
          <motion.div 
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setManagingPhoto(null)}
          >
            <button className="close-btn" onClick={() => setManagingPhoto(null)}><X size={32} /></button>
            <motion.div 
              className="manage-modal glass"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '450px', width: '90%' }}
            >
              <div className="modal-header">
                <h3><Camera size={20} /> Manage Umpire Photo</h3>
                <p>Update photo for umpire <strong>{managingPhoto.name}</strong></p>
              </div>

              <div className="upload-form">
                {/* Preview */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <div className="org-image-container" style={{ width: '150px', height: '150px', margin: 0, borderRadius: '50%', borderStyle: 'solid' }}>
                    {managingPhoto.image ? (
                      <img src={managingPhoto.image} alt={managingPhoto.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <div className="avatar-placeholder" style={{ borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', background: 'var(--color-neutral)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-secondary)' }}>{managingPhoto.name[0]}</div>
                    )}
                  </div>
                </div>

                {/* Option 1: File Upload */}
                <div className="form-group">
                  <label>Upload Image File</label>
                  <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem' }}>
                    <Upload size={16} />
                    Choose File
                    <input 
                      type="file" 
                      hidden 
                      onChange={(e) => handleImageUpload(managingPhoto.id, e)} 
                      accept="image/*" 
                    />
                  </label>
                </div>

                {/* Option 2: Image URL */}
                <div className="form-group">
                  <label>Image URL</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={manualUrl} 
                      onChange={(e) => setManualUrl(e.target.value)} 
                      placeholder="Paste image URL here..."
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button"
                      className="btn-primary" 
                      style={{ padding: '0.5rem 1rem', boxShadow: 'none' }}
                      onClick={() => {
                        updateUmpireImage(managingPhoto.id, manualUrl);
                        setManagingPhoto(prev => ({ ...prev, image: manualUrl }));
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Option 3: Remove Image */}
                {managingPhoto.image && (
                  <button 
                    type="button"
                    className="btn-secondary" 
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
                    onClick={() => {
                      if (window.confirm("Remove this photo?")) {
                        updateUmpireImage(managingPhoto.id, null);
                        setManagingPhoto(prev => ({ ...prev, image: null }));
                        setManualUrl('');
                      }
                    }}
                  >
                    <Trash2 size={16} />
                    Remove Photo
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Officials;
