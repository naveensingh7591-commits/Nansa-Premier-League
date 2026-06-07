import { supabase } from '../supabase_client';

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
    // 1. Save Locally for instant UI update
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(items, 'current_items');

    // 2. Sync to Supabase (Cloud)
    // We store the items array as a JSON blob in a 'settings' table or similar
    // For simplicity, we'll try to upsert to a 'gallery' table
    const { error } = await supabase
      .from('site_data')
      .upsert({ id: 'gallery', data: items });
    
    if (error) console.warn("Supabase Sync Warning:", error.message);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error("Storage Save Error:", error);
  }
};

export const loadGalleryItems = async () => {
  let cloudItems = null;
  try {
    // 1. Try to load from Supabase (Cloud) first for latest data
    const { data, error } = await supabase
      .from('site_data')
      .select('data')
      .eq('id', 'gallery')
      .single();

    if (data && data.data) {
      cloudItems = data.data;
    } else if (error) {
      console.warn("Supabase load returned error, will fallback to local storage:", error.message);
    }
  } catch (error) {
    console.warn("Supabase connection failed, falling back to local storage:", error);
  }

  // If cloud fetch was successful and has data, return it
  if (cloudItems) {
    return cloudItems;
  }

  // 2. Fallback to Local IndexedDB if Cloud fails or has no data
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('current_items');
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (localError) {
    console.error("Local database load failed:", localError);
    return null;
  }
};
