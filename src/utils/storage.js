import { supabase } from '../supabase_client';
import { initialGalleryItems } from './initialGallery';

// Native IndexedDB wrapper for large data storage (Local Fallback)
const DB_NAME = 'NPL_Portal_DB';
const STORE_NAME = 'gallery_items';
const DB_VERSION = 1;

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const saveGalleryItems = async (items) => {
  try {
    // Only save CUSTOM (non-default) items to avoid large payloads
    const defaultIds = new Set(initialGalleryItems.map(item => item.id));
    const customItems = items.filter(item => !defaultIds.has(item.id));

    // 1. Save custom items locally (IndexedDB)
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.put(customItems, 'current_items');
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event.target.error);
    });

    // 2. Sync only custom items to Supabase (avoids large base64 + asset URLs)
    const { error } = await supabase
      .from('site_data')
      .upsert({ id: 'gallery', data: customItems });
    
    if (error) {
      console.warn("Supabase Sync Warning:", error.message);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Storage Save Error:", error);
    throw error;
  }
};

export const loadGalleryItems = async () => {
  let customItems = [];

  try {
    // 1. Try to load custom items from Supabase (Cloud)
    const { data, error } = await supabase
      .from('site_data')
      .select('data')
      .eq('id', 'gallery')
      .single();

    if (data && data.data && Array.isArray(data.data)) {
      // Filter out any accidentally saved default items from old format
      const defaultIds = new Set(initialGalleryItems.map(item => item.id));
      customItems = data.data.filter(item => !defaultIds.has(item.id));
    } else if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine for a fresh install
      console.warn("Supabase load warning:", error.message);
      throw error; // fall through to IndexedDB
    }
  } catch (error) {
    // 2. Fallback to Local IndexedDB if Cloud fails
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('current_items');

      const localResult = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (event) => reject(event.target.error);
      });

      if (Array.isArray(localResult)) {
        const defaultIds = new Set(initialGalleryItems.map(item => item.id));
        customItems = localResult.filter(item => !defaultIds.has(item.id));
      }
    } catch (localError) {
      console.warn("Local database load failed:", localError);
    }
  }

  // Always merge: defaults first (always fresh from local bundle), then custom items
  return [...initialGalleryItems, ...customItems];
};
