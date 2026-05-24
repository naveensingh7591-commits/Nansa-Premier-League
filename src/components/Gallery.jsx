import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, PlayCircle, Plus, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { saveGalleryItems, loadGalleryItems } from '../utils/storage';
import trophyImg from '../assets/trophy.png';
import buntyImg from '../assets/bunty-singh.jpg';
import pramodImg from '../assets/pramod-lefty.jpg';
import pankajImg from '../assets/pankaj-nishad.jpg';
import ajeetImg from '../assets/ajeet-singh.jpg';
import anujImg from '../assets/anuj-singh.jpg';

const Gallery = ({ initialFilter = 'All' }) => {
  const isAdmin = localStorage.getItem('npl_admin') === 'true';
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState(initialFilter);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [uploadData, setUploadData] = useState({ 
    title: '', 
    category: initialFilter === 'All' ? 'Celebration' : initialFilter, 
    images: [] 
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (filter !== 'All') {
      setUploadData(prev => ({ ...prev, category: filter }));
    }
  }, [filter]);

  const initialItems = [
    { id: 2, type: 'image', category: 'Celebration', url: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&q=80&w=800', title: 'Champions Celebration' },
    { id: 5, type: 'image', category: 'Trophy', url: trophyImg, title: 'The Official NPL Trophy' },
    { id: 6, type: 'image', category: 'Umpires', url: buntyImg, title: 'Bunty Singh - Match Official' },
    { id: 7, type: 'image', category: 'Umpires', url: pramodImg, title: 'Pramod Lefty - Match Official' },
    { id: 8, type: 'image', category: 'Commentators', url: pankajImg, title: 'Pankaj Nishad - Lead Commentator' },
    { id: 9, type: 'image', category: 'Commentators', url: ajeetImg, title: 'Ajeet Singh - Lead Commentator' },
    { id: 10, type: 'image', category: 'Scorers', url: anujImg, title: 'Anuj Singh - Official Scorer' },
  ];

  const [items, setItems] = useState(initialItems);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load items from IndexedDB on mount
  useEffect(() => {
    const initStorage = async () => {
      try {
        const savedItems = await loadGalleryItems();
        if (savedItems && savedItems.length > 0) {
          setItems(savedItems);
        } else {
          // Fallback for transition from localStorage
          const legacyItems = localStorage.getItem('npl_gallery_items');
          if (legacyItems) {
            const parsed = JSON.parse(legacyItems);
            setItems(parsed);
            await saveGalleryItems(parsed);
            localStorage.removeItem('npl_gallery_items');
          }
        }
      } catch (err) {
        console.error("Storage initialization failed", err);
      } finally {
        setIsLoaded(true);
      }
    };
    initStorage();
  }, []);

  // Save items whenever they change, but ONLY after initial load is done
  useEffect(() => {
    if (isLoaded) {
      setSyncStatus('Syncing to Cloud...');
      saveGalleryItems(items).then(() => {
        setSyncStatus('Cloud Synced ✓');
        setTimeout(() => setSyncStatus(''), 2000);
      });
    }
  }, [items, isLoaded]);

  const categories = ['All', 'Celebration', 'Trophy', 'Organizers', 'Umpires', 'Commentators', 'Scorers'];

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 1200; // Good quality but manageable size
          
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
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setIsUploading(true);
      const newImages = [];

      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const compressedUrl = await compressImage(file);
          newImages.push({
            url: compressedUrl,
            name: file.name.split('.')[0]
          });
        }
      }
      
      setUploadData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
      setIsUploading(false);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (uploadData.images.length === 0 || isUploading) return;

    const newItems = uploadData.images.map((img, index) => ({
      id: Date.now() + index,
      type: 'image',
      category: uploadData.category,
      url: img.url,
      title: uploadData.title || img.name
    }));

    setItems([...newItems, ...items]);
    setIsManageOpen(false);
    setUploadData({ title: '', category: filter === 'All' ? 'Celebration' : filter, images: [] });
  };

  const handleDeleteItem = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this photo from the gallery?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const filteredItems = filter === 'All' ? items : items.filter(item => item.category === filter);

  return (
    <section id="gallery" className="gallery-section">
      <div className="section-header-flex">
        <h2 className="section-title">NPL <span>{filter === 'All' ? 'Gallery' : filter}</span></h2>
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {syncStatus && <span className="sync-status">{syncStatus}</span>}
            <button 
              className="btn-secondary manage-btn"
              onClick={() => setIsManageOpen(true)}
            >
              <Plus size={16} style={{ marginRight: '8px' }} />
              Manage Gallery
            </button>
          </div>
        )}
      </div>
      
      <div className="filter-bar">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="gallery-horizontal-scroll">
        <AnimatePresence>
          {filteredItems.map((item) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="gallery-thumb-item glass"
              onClick={() => setSelectedImage(item)}
            >
              <img src={item.url} alt={item.title} />
              <div className="gallery-hover">
                <div className="gallery-actions">
                  {isAdmin && (
                    <button 
                      className="action-btn delete-btn"
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      title="Delete Photo"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  {item.type === 'video' ? <PlayCircle size={48} /> : <Maximize2 size={32} />}
                </div>
                <p>{item.title}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isManageOpen && (
          <motion.div 
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className="close-btn" onClick={() => setIsManageOpen(false)}><X size={32} /></button>
            <motion.div 
              className="manage-modal glass"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3><Upload size={20} /> Bulk Upload <span>Gallery</span></h3>
                <p>Select multiple photos to add them all at once.</p>
              </div>

              <form onSubmit={handleAddItem} className="upload-form">
                <div className="upload-zone" onClick={() => fileInputRef.current.click()}>
                  {uploadData.images.length > 0 ? (
                    <div className="upload-previews-grid">
                      {uploadData.images.slice(0, 4).map((img, i) => (
                        <img key={i} src={img.url} alt="Preview" className="mini-preview" />
                      ))}
                      {uploadData.images.length > 4 && (
                        <div className="more-count">+{uploadData.images.length - 4}</div>
                      )}
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <ImageIcon size={48} />
                      <span>Click to select multiple photos</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    onChange={handleFileUpload}
                    accept="image/*"
                    multiple
                  />
                </div>

                <div className="form-group">
                  <label>Base Title (Optional)</label>
                  <input 
                    type="text" 
                    value={uploadData.title}
                    onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                    placeholder="Defaults to filenames if empty"
                  />
                </div>

                <div className="form-group">
                  <label>Category for all</label>
                  <select 
                    value={uploadData.category}
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary upload-submit-btn"
                  disabled={isUploading || uploadData.images.length === 0}
                >
                  {isUploading ? 'Processing Photos...' : `Add ${uploadData.images.length} Photos to Gallery`}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <button className="close-btn"><X size={32} /></button>
            <motion.div 
              className="lightbox-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedImage.url} alt={selectedImage.title} />
              <div className="lightbox-info">
                <h3>{selectedImage.title}</h3>
                <span>{selectedImage.category}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
