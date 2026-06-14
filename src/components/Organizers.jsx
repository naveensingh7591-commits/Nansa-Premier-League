import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ShieldCheck, Users, Edit3, Camera, X, Upload, Trash2, Plus } from 'lucide-react';
import { supabase } from '../supabase_client';
import { initialGalleryItems } from '../utils/initialGallery';

const Organizers = () => {
  const isAdmin = localStorage.getItem('npl_admin') === 'true';
  const [mainOrganizers, setMainOrganizers] = React.useState([
    { id: 'm1', name: "Prabhat Singh", phone: "8090964913", role: "Main Organizer", image: null },
    { id: 'm2', name: "Anand Singh", phone: "7310065275", role: "Main Organizer", image: null },
    { id: 'm3', name: "Sudhir Singh", phone: "7800724140", role: "Main Organizer", image: null },
  ]);

  const [leadCoOrganizers, setLeadCoOrganizers] = React.useState([
    { id: 'l1', name: "Abhishek Singh", image: null },
    { id: 'l2', name: "Ajay Pratap Singh", image: null },
    { id: 'l3', name: "Atul Singh", image: null },
    { id: 'l4', name: "Avinash Singh", image: null },
    { id: 'l5', name: "Ritesh Singh", image: null }
  ]);

  const [coOrganizers, setCoOrganizers] = React.useState([
    { id: 'c1', name: "Shiva Singh", image: null },
    { id: 'c2', name: "Abhishek II", image: null },
    { id: 'c3', name: "Pramod Lefty", image: null }
  ]);

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [managingPhoto, setManagingPhoto] = React.useState(null); // { id, name, type, image }
  const [manualUrl, setManualUrl] = React.useState('');
  const [managingSegment, setManagingSegment] = React.useState(null); // 'main', 'lead', or 'field'
  const [tempSegmentList, setTempSegmentList] = React.useState([]);
  const adminEdited = React.useRef(false);

  React.useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.from('site_data').select('data').eq('id', 'organizers').single();
      if (data && data.data) {
        if (data.data.main) setMainOrganizers(data.data.main);
        if (data.data.lead) setLeadCoOrganizers(data.data.lead);
        if (data.data.co) setCoOrganizers(data.data.co);
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  React.useEffect(() => {
    if (isLoaded && adminEdited.current) {
      supabase.from('site_data').upsert({
        id: 'organizers',
        data: { main: mainOrganizers, lead: leadCoOrganizers, co: coOrganizers }
      }).then(({ error }) => {
        if (error) console.error('Failed to save organizers:', error.message);
      });
    }
  }, [mainOrganizers, leadCoOrganizers, coOrganizers, isLoaded]);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 400; // Avatars don't need to be massive
          
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
        category: 'Organizers',
        url: imageUrl,
        title: title
      };
      
      galleryItems = galleryItems.filter(item => !(item.category === 'Organizers' && item.title === title));
      galleryItems = [newItem, ...galleryItems];
      await supabase.from('site_data').upsert({ id: 'gallery', data: galleryItems });
      
      const db = await new Promise((resolve) => {
        const req = indexedDB.open('NPL_Portal_DB', 1);
        req.onsuccess = (e) => resolve(e.target.result);
      });
      const tx = db.transaction('gallery_items', 'readwrite');
      tx.objectStore('gallery_items').put(galleryItems, 'current_items');
    } catch (err) {
      console.error("Failed to sync organizer photo to gallery", err);
    }
  };

  const updateOrgImage = (id, type, imageUrl) => {
    const updateFn = (list) => list.map(item => item.id === id ? { ...item, image: imageUrl } : item);
    adminEdited.current = true;
    
    if (type === 'main') {
      const org = mainOrganizers.find(o => o.id === id);
      if (imageUrl && org) addToGallery(imageUrl, org.name, org.role);
      setMainOrganizers(updateFn);
    } else if (type === 'lead') {
      const org = leadCoOrganizers.find(o => o.id === id);
      if (imageUrl && org) addToGallery(imageUrl, org.name, 'Lead Support');
      setLeadCoOrganizers(updateFn);
    } else {
      const org = coOrganizers.find(o => o.id === id);
      if (imageUrl && org) addToGallery(imageUrl, org.name, 'Field Support');
      setCoOrganizers(updateFn);
    }
  };

  const handleImageUpload = async (id, type, e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const compressedUrl = await compressImage(file);
      updateOrgImage(id, type, compressedUrl);
      if (managingPhoto) {
        setManagingPhoto(prev => ({ ...prev, image: compressedUrl }));
      }
    }
  };

  const PhotoPlaceholder = ({ org, type }) => (
    <div 
      className={`photo-placeholder ${isAdmin ? 'clickable' : ''}`} 
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
      onClick={() => {
        if (isAdmin) {
          setManagingPhoto({ id: org.id, name: org.name, type, image: org.image });
          setManualUrl(org.image || '');
        }
      }}
    >
      {isAdmin && <Camera size={20} />}
      <span>{isAdmin ? 'Add Photo' : org.name[0]}</span>
    </div>
  );

  return (
    <section id="organizers" className="organizers-section">
      <div className="section-header-flex">
        <h2 className="section-title">Tournament <span>Organizers</span></h2>
        {isAdmin && (
          <button 
            className="btn-secondary manage-btn"
            onClick={() => {
              setManagingSegment('main');
              setTempSegmentList([...mainOrganizers]);
            }}
          >
            <Edit3 size={14} style={{ marginRight: '8px' }} />
            Manage Organizers
          </button>
        )}
      </div>

      <div className="organizers-grid main-organizers">
        {mainOrganizers.map((org, index) => (
          <motion.div 
            key={org.id}
            className="organizer-card glass"
            whileHover={{ y: -5, boxShadow: "var(--stadium-glow)" }}
          >
            <div className="org-image-container">
              {org.image ? (
                <div className="img-wrapper">
                  <img src={org.image} alt={org.name} className="org-photo" />
                  {isAdmin && (
                    <div 
                      className="change-photo-overlay"
                      onClick={() => {
                        setManagingPhoto({ id: org.id, name: org.name, type: 'main', image: org.image });
                        setManualUrl(org.image || '');
                      }}
                    >
                      <Camera size={16} />
                    </div>
                  )}
                </div>
              ) : (
                <PhotoPlaceholder org={org} type="main" />
              )}
              <div className="org-badge">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className="org-info">
              <h3>{org.name}</h3>
              <p className="role">{org.role}</p>
              <a href={`tel:${org.phone}`} className="phone-link">
                <Phone size={14} />
                {org.phone}
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="section-header-flex" style={{ marginTop: '4rem', marginBottom: '2rem' }}>
        <h3 className="section-title" style={{ fontSize: '2.5rem' }}>Lead <span>Support</span></h3>
        {isAdmin && (
          <button 
            className="btn-secondary manage-btn"
            onClick={() => {
              setManagingSegment('lead');
              setTempSegmentList([...leadCoOrganizers]);
            }}
          >
            <Edit3 size={14} style={{ marginRight: '8px' }} />
            Manage Lead Support
          </button>
        )}
      </div>
      <div className="organizers-grid">
        {leadCoOrganizers.map((org) => (
          <motion.div 
            key={org.id}
            className="organizer-card glass"
            whileHover={{ y: -5, boxShadow: "var(--stadium-glow)" }}
          >
            <div className="org-image-container">
              {org.image ? (
                <div className="img-wrapper">
                  <img src={org.image} alt={org.name} className="org-photo" />
                  {isAdmin && (
                    <div 
                      className="change-photo-overlay"
                      onClick={() => {
                        setManagingPhoto({ id: org.id, name: org.name, type: 'lead', image: org.image });
                        setManualUrl(org.image || '');
                      }}
                    >
                      <Camera size={16} />
                    </div>
                  )}
                </div>
              ) : (
                <PhotoPlaceholder org={org} type="lead" />
              )}
              <div className="org-badge">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className="org-info">
              <h3>{org.name}</h3>
              <p className="role">Lead Support</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="section-header-flex" style={{ marginTop: '4rem', marginBottom: '2rem' }}>
        <h3 className="section-title" style={{ fontSize: '2.5rem' }}>Field <span>Support</span></h3>
        {isAdmin && (
          <button 
            className="btn-secondary manage-btn"
            onClick={() => {
              setManagingSegment('field');
              setTempSegmentList([...coOrganizers]);
            }}
          >
            <Edit3 size={14} style={{ marginRight: '8px' }} />
            Manage Field Support
          </button>
        )}
      </div>
      <div className="organizers-grid">
        {coOrganizers.map((org) => (
          <motion.div 
            key={org.id}
            className="organizer-card glass"
            whileHover={{ y: -5, boxShadow: "var(--stadium-glow)" }}
          >
            <div className="org-image-container">
              {org.image ? (
                <div className="img-wrapper">
                  <img src={org.image} alt={org.name} className="org-photo" />
                  {isAdmin && (
                    <div 
                      className="change-photo-overlay"
                      onClick={() => {
                        setManagingPhoto({ id: org.id, name: org.name, type: 'field', image: org.image });
                        setManualUrl(org.image || '');
                      }}
                    >
                      <Camera size={16} />
                    </div>
                  )}
                </div>
              ) : (
                <PhotoPlaceholder org={org} type="field" />
              )}
              <div className="org-badge">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className="org-info">
              <h3>{org.name}</h3>
              <p className="role">Field Support</p>
            </div>
          </motion.div>
        ))}
      </div>

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
              style={{ maxWidth: '450px' }}
            >
              <div className="modal-header">
                <h3><Camera size={20} /> Manage Photo</h3>
                <p>Update photo for <strong>{managingPhoto.name}</strong></p>
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
                      onChange={(e) => handleImageUpload(managingPhoto.id, managingPhoto.type, e)} 
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
                        updateOrgImage(managingPhoto.id, managingPhoto.type, manualUrl);
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
                        updateOrgImage(managingPhoto.id, managingPhoto.type, null);
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

      <AnimatePresence>
        {managingSegment && (
          <motion.div 
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setManagingSegment(null)}
          >
            <button className="close-btn" onClick={() => setManagingSegment(null)}><X size={32} /></button>
            <motion.div 
              className="manage-modal glass"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '600px', width: '90%' }}
            >
              <div className="modal-header">
                <h3>
                  <Edit3 size={20} style={{ marginRight: '8px' }} />
                  Manage {managingSegment === 'main' ? 'Organizers' : managingSegment === 'lead' ? 'Lead Support' : 'Field Support'}
                </h3>
                <p>Add, edit, or remove members in this section.</p>
              </div>

              <div className="upload-form" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tempSegmentList.map((member, idx) => (
                  <div key={member.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: 'var(--radius-default)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        value={member.name}
                        onChange={(e) => {
                          const updated = [...tempSegmentList];
                          updated[idx].name = e.target.value;
                          setTempSegmentList(updated);
                        }}
                        placeholder="Member Name"
                        style={{ width: '100%' }}
                      />
                      {managingSegment === 'main' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            type="text" 
                            value={member.phone || ''}
                            onChange={(e) => {
                              const updated = [...tempSegmentList];
                              updated[idx].phone = e.target.value;
                              setTempSegmentList(updated);
                            }}
                            placeholder="Phone Number"
                            style={{ flex: 1 }}
                          />
                          <input 
                            type="text" 
                            value={member.role || 'Main Organizer'}
                            onChange={(e) => {
                              const updated = [...tempSegmentList];
                              updated[idx].role = e.target.value;
                              setTempSegmentList(updated);
                            }}
                            placeholder="Role (e.g. Main Organizer)"
                            style={{ flex: 1 }}
                          />
                        </div>
                      )}
                    </div>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => {
                        setTempSegmentList(tempSegmentList.filter(item => item.id !== member.id));
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {tempSegmentList.length === 0 && (
                  <p style={{ textAlign: 'center', opacity: 0.5, margin: '2rem 0' }}>No members in this segment yet.</p>
                )}

                <button 
                  type="button" 
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                  onClick={() => {
                    const newId = 'new_' + Date.now();
                    const newMember = managingSegment === 'main' 
                      ? { id: newId, name: '', phone: '', role: 'Main Organizer', image: null }
                      : { id: newId, name: '', image: null };
                    setTempSegmentList([...tempSegmentList, newMember]);
                  }}
                >
                  <Plus size={16} />
                  Add Member
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button"
                  className="btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setManagingSegment(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn-primary" 
                  style={{ flex: 1, boxShadow: 'none' }}
                  onClick={() => {
                    adminEdited.current = true;
                    if (managingSegment === 'main') {
                      setMainOrganizers(tempSegmentList);
                    } else if (managingSegment === 'lead') {
                      setLeadCoOrganizers(tempSegmentList);
                    } else if (managingSegment === 'field') {
                      setCoOrganizers(tempSegmentList);
                    }
                    setManagingSegment(null);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Organizers;
