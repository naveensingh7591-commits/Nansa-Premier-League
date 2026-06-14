import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, PlayCircle, Plus, Upload, Image as ImageIcon, Trash2, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { saveGalleryItems, loadGalleryItems } from '../utils/storage';
import { initialGalleryItems } from '../utils/initialGallery';

const Gallery = ({ initialFilter = 'All' }) => {
  const isAdmin = localStorage.getItem('npl_admin') === 'true';
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState(initialFilter);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const autoPlayRef = useRef(null);
  const carouselRef = useRef(null);

  const [uploadData, setUploadData] = useState({ 
    title: '', 
    category: initialFilter === 'All' ? 'Celebration' : initialFilter, 
    images: [] 
  });
  const fileInputRef = useRef(null);
  const adminEdited = useRef(false);

  useEffect(() => {
    if (filter !== 'All') {
      setUploadData(prev => ({ ...prev, category: filter }));
    }
  }, [filter]);

  const [items, setItems] = useState(initialGalleryItems);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initStorage = async () => {
      try {
        const savedItems = await loadGalleryItems();
        if (savedItems && savedItems.length > 0) {
          setItems(savedItems);
        } else {
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

  useEffect(() => {
    if (isLoaded && adminEdited.current) {
      setSyncStatus('Syncing to Cloud...');
      saveGalleryItems(items).then(() => {
        setSyncStatus('Cloud Synced ✓');
        setTimeout(() => setSyncStatus(''), 2000);
      }).catch((err) => {
        console.error('Failed to save gallery items:', err);
        setSyncStatus('Sync Failed ✗');
        setTimeout(() => setSyncStatus(''), 3000);
      });
    }
  }, [items, isLoaded]);

  const categories = ['All', 'Celebration', 'Trophy', 'Organizers', 'Umpires', 'Commentators', 'Scorers'];
  const filteredItems = filter === 'All' ? items : items.filter(item => item.category === filter);

  // Reset carousel index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [filter]);

  // Clamp index when items change
  useEffect(() => {
    if (filteredItems.length > 0 && currentIndex >= filteredItems.length) {
      setCurrentIndex(filteredItems.length - 1);
    }
  }, [filteredItems.length]);

  const goNext = useCallback(() => {
    if (filteredItems.length === 0) return;
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % filteredItems.length);
  }, [filteredItems.length]);

  const goPrev = useCallback(() => {
    if (filteredItems.length === 0) return;
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
  }, [filteredItems.length]);

  const goToIndex = (idx) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  // Autoplay
  useEffect(() => {
    if (isAutoPlaying && filteredItems.length > 1) {
      autoPlayRef.current = setInterval(goNext, 3500);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying, goNext, filteredItems.length]);

  // Touch/drag handling
  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragStartX(e.type === 'touchstart' ? e.touches[0].clientX : e.clientX);
    clearInterval(autoPlayRef.current);
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    const endX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStartX - endX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
    setIsDragging(false);
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(goNext, 3500);
    }
  };

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

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setIsUploading(true);
      const newImages = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const compressedUrl = await compressImage(file);
          newImages.push({ url: compressedUrl, name: file.name.split('.')[0] });
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
    adminEdited.current = true;
    setItems([...newItems, ...items]);
    setIsManageOpen(false);
    setUploadData({ title: '', category: filter === 'All' ? 'Celebration' : filter, images: [] });
  };

  const handleDeleteItem = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this photo from the gallery?')) {
      adminEdited.current = true;
      setItems(items.filter(item => item.id !== id));
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0, scale: 0.95 }),
  };

  const currentItem = filteredItems[currentIndex];

  // Thumbnail strip: show up to 5 around the current index
  const getVisibleThumbs = () => {
    if (filteredItems.length <= 5) return filteredItems.map((_, i) => i);
    const half = 2;
    let start = Math.max(0, currentIndex - half);
    let end = Math.min(filteredItems.length - 1, start + 4);
    start = Math.max(0, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <section id="gallery" className="gallery-section">
      <div className="section-header-flex">
        <h2 className="section-title">NPL <span>{filter === 'All' ? 'Gallery' : filter}</span></h2>
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {syncStatus && <span className="sync-status">{syncStatus}</span>}
            <button className="btn-secondary manage-btn" onClick={() => setIsManageOpen(true)}>
              <Plus size={16} style={{ marginRight: '8px' }} />
              Manage Gallery
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar gallery-filter-bar">
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

      {/* Carousel */}
      {filteredItems.length === 0 ? (
        <div className="gallery-empty">
          <ImageIcon size={48} />
          <p>No photos in this category yet.</p>
        </div>
      ) : (
        <div className="gallery-carousel-wrapper">
          {/* Main Stage */}
          <div
            className="gallery-carousel-stage"
            ref={carouselRef}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onMouseLeave={() => isDragging && handleDragEnd({ clientX: dragStartX })}
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
          >
            <AnimatePresence custom={direction} mode="popLayout">
              <motion.div
                key={currentItem.id}
                className="gallery-carousel-slide"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                onClick={() => setSelectedImage(currentItem)}
              >
                <img src={currentItem.url} alt="" className="carousel-slide-bg-blur" draggable={false} />
                <img src={currentItem.url} alt={currentItem.title} className="carousel-slide-main-img" draggable={false} />
                <div className="carousel-slide-overlay">
                  <div className="carousel-slide-info">
                    <span className="carousel-slide-category">{currentItem.category}</span>
                    <h3 className="carousel-slide-title">{currentItem.title}</h3>
                  </div>
                  <div className="carousel-slide-actions">
                    {isAdmin && (
                      <button
                        className="action-btn delete-btn"
                        onClick={(e) => handleDeleteItem(currentItem.id, e)}
                        title="Delete Photo"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button className="action-btn expand-btn" title="View Fullscreen">
                      {currentItem.type === 'video' ? <PlayCircle size={20} /> : <Maximize2 size={20} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Nav Arrows */}
            {filteredItems.length > 1 && (
              <>
                <button
                  className="carousel-arrow carousel-arrow-left"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  className="carousel-arrow carousel-arrow-right"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  aria-label="Next photo"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            {/* Counter badge */}
            <div className="carousel-counter">
              {currentIndex + 1} / {filteredItems.length}
            </div>

            {/* Autoplay toggle */}
            <button
              className="carousel-autoplay-btn"
              onClick={(e) => { e.stopPropagation(); setIsAutoPlaying(p => !p); }}
              title={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>

          {/* Dot Indicators */}
          {filteredItems.length > 1 && (
            <div className="carousel-dots">
              {filteredItems.map((_, idx) => (
                <button
                  key={idx}
                  className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => goToIndex(idx)}
                  aria-label={`Go to photo ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail Strip */}
          {filteredItems.length > 1 && (
            <div className="carousel-thumbs">
              {getVisibleThumbs().map(idx => (
                <button
                  key={idx}
                  className={`carousel-thumb ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => goToIndex(idx)}
                  aria-label={`Photo ${idx + 1}`}
                >
                  <img src={filteredItems[idx].url} alt={filteredItems[idx].title} draggable={false} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="Defaults to filenames if empty"
                  />
                </div>

                <div className="form-group">
                  <label>Category for all</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
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

      {/* Lightbox */}
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
