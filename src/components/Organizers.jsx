import React from 'react';
import { motion } from 'framer-motion';
import { Phone, ShieldCheck, Users, Edit3, Camera } from 'lucide-react';
import { supabase } from '../supabase_client';

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
    if (isLoaded) {
      supabase.from('site_data').upsert({
        id: 'organizers',
        data: { main: mainOrganizers, lead: leadCoOrganizers, co: coOrganizers }
      }).then();
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
      let galleryItems = (data && data.data) ? data.data : [];
      
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

  const handleImageUpload = async (id, type, e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const compressedUrl = await compressImage(file);
      const updateFn = (list) => list.map(item => item.id === id ? { ...item, image: compressedUrl } : item);
      
      if (type === 'main') {
        const org = mainOrganizers.find(o => o.id === id);
        addToGallery(compressedUrl, org.name, org.role);
        setMainOrganizers(updateFn);
      } else if (type === 'lead') {
        const org = leadCoOrganizers.find(o => o.id === id);
        addToGallery(compressedUrl, org.name, 'Lead Support');
        setLeadCoOrganizers(updateFn);
      } else {
        const org = coOrganizers.find(o => o.id === id);
        addToGallery(compressedUrl, org.name, 'Field Support');
        setCoOrganizers(updateFn);
      }
    }
  };

  const PhotoPlaceholder = ({ name, id, type }) => (
    <label className={`photo-placeholder ${isAdmin ? 'clickable' : ''}`} style={{ width: '100%', height: '100%' }}>
      {isAdmin && <input type="file" hidden onChange={(e) => handleImageUpload(id, type, e)} accept="image/*" />}
      {isAdmin && <Camera size={20} />}
      <span>{isAdmin ? 'Add Photo' : name[0]}</span>
    </label>
  );

  return (
    <section id="organizers" className="organizers-section">
      <div className="section-header-flex">
        <h2 className="section-title">Tournament <span>Organizers</span></h2>
        {isAdmin && (
          <button className="btn-secondary manage-btn">
            <Edit3 size={14} style={{ marginRight: '8px' }} />
            Manage Team
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
                    <label className="change-photo-overlay">
                      <input type="file" hidden onChange={(e) => handleImageUpload(org.id, 'main', e)} accept="image/*" />
                      <Camera size={16} />
                    </label>
                  )}
                </div>
              ) : (
                <PhotoPlaceholder name={org.name} id={org.id} type="main" />
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
                    <label className="change-photo-overlay">
                      <input type="file" hidden onChange={(e) => handleImageUpload(org.id, 'lead', e)} accept="image/*" />
                      <Camera size={16} />
                    </label>
                  )}
                </div>
              ) : (
                <PhotoPlaceholder name={org.name} id={org.id} type="lead" />
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
                    <label className="change-photo-overlay">
                      <input type="file" hidden onChange={(e) => handleImageUpload(org.id, 'field', e)} accept="image/*" />
                      <Camera size={16} />
                    </label>
                  )}
                </div>
              ) : (
                <PhotoPlaceholder name={org.name} id={org.id} type="field" />
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
    </section>
  );
};

export default Organizers;
