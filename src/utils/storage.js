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
    // 1. Save Locally for instant UI update
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.put(items, 'current_items');
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event.target.error);
    });

    // 2. Sync to Supabase (Cloud)
    const { error } = await supabase
      .from('site_data')
      .upsert({ id: 'gallery', data: items });
    
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

  let loadedItems = null;
  // If cloud fetch was successful and has data, return it
  if (cloudItems) {
    loadedItems = cloudItems;
  } else {
    // 2. Fallback to Local IndexedDB if Cloud fails or has no data
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('current_items');
      
      const localResult = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = (event) => reject(event.target.error);
      });
      loadedItems = localResult;
    } catch (localError) {
      console.warn("Local database load failed:", localError);
    }
  }

  // Ensure default items exist in the returned list
  if (!loadedItems) {
    return initialGalleryItems;
  }
  const defaultIds = initialGalleryItems.map(item => item.id);
  const hasAnyDefault = loadedItems.some(item => defaultIds.includes(item.id));
  if (!hasAnyDefault) {
    // Prepend all initial gallery items if none of them are present
    return [...initialGalleryItems, ...loadedItems];
  }
  return loadedItems;
};
