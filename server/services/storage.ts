import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { MongoDBService, connectToMongoDB, isMongoDBConfigured } from './mongodb';

dotenv.config();

// Check if required environment variables are present
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;

// Validate Supabase configuration
const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Supabase client - only initialize if properly configured
let supabase: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    console.log('Supabase client initialized');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
}

// Firebase configuration validation
const isFirebaseConfigured = !!(
  FIREBASE_PROJECT_ID && 
  FIREBASE_CLIENT_EMAIL && 
  FIREBASE_PRIVATE_KEY
);

// Initialize Firebase Admin only if properly configured
let firebaseApp: admin.app.App | null = null;
let firebaseStorage: admin.storage.Storage | null = null;
let firebaseDb: admin.firestore.Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${FIREBASE_PROJECT_ID}.appspot.com`
    });
    firebaseStorage = firebaseApp.storage();
    firebaseDb = firebaseApp.firestore();
    console.log('Firebase initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
} else {
  console.warn('Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
}

export { supabase, firebaseStorage, firebaseDb };

export const isStorageConfigured = isSupabaseConfigured || isFirebaseConfigured || isMongoDBConfigured;

export const configuredServices = {
  supabase: isSupabaseConfigured,
  firebase: isFirebaseConfigured,
  mongodb: isMongoDBConfigured
};

export interface StorageService {
  saveData(collection: string, data: any): Promise<any>;
  getData(collection: string, id?: string): Promise<any>;
  updateData(collection: string, id: string, data: any): Promise<any>;
  deleteData(collection: string, id: string): Promise<any>;
  uploadFile(file: Buffer, filename: string, contentType: string): Promise<string>;
}

export class SupabaseService implements StorageService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async saveData(collection: string, data: any) {
    if (!this.client) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    const { data: result, error } = await this.client
      .from(collection)
      .insert([data])
      .select();
    
    if (error) { 
      console.error('Supabase save error:', error);
      throw new Error(`Failed to save data: ${error.message}`);
    }
    return result?.[0];
  }

  async getData(collection: string, id?: string) {
    if (!this.client) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    if (id) {
      const { data, error } = await this.client
        .from(collection)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) { 
        console.error('Supabase get error:', error);
        throw new Error(`Failed to get data: ${error.message}`);
      }
      return data;
    } else {
      const { data, error } = await this.client
        .from(collection)
        .select('*');
      
      if (error) { 
        console.error('Supabase get error:', error);
        throw new Error(`Failed to get data: ${error.message}`);
      }
      return data || [];
    }
  }

  async updateData(collection: string, id: string, data: any) {
    if (!this.client) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    const { data: result, error } = await this.client
      .from(collection)
      .update(data)
      .eq('id', id)
      .select();
    
    if (error) { 
      console.error('Supabase update error:', error);
      throw new Error(`Failed to update data: ${error.message}`);
    }
    return result?.[0];
  }

  async deleteData(collection: string, id: string) {
    if (!this.client) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    const { error } = await this.client
      .from(collection)
      .delete()
      .eq('id', id);
    
    if (error) { 
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete data: ${error.message}`);
    }
    return true;
  }

  async uploadFile(file: Buffer, filename: string, contentType: string): Promise<string> {
    if (!this.client) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    const { data, error } = await this.client.storage
      .from('uploads')
      .upload(filename, file, {
        contentType,
        upsert: true
      });
    
    if (error) { 
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    
    const { data: urlData } = this.client.storage
      .from('uploads')
      .getPublicUrl(filename);
    
    return urlData.publicUrl;
  }
}

export class FirebaseService implements StorageService {
  private db: admin.firestore.Firestore;
  private storage: admin.storage.Storage;

  constructor(db: admin.firestore.Firestore, storage: admin.storage.Storage) {
    this.db = db;
    this.storage = storage;
  }

  async saveData(collection: string, data: any) {
    if (!this.db) {
      throw new Error('Firebase is not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
    }

    const docRef = await this.db.collection(collection).add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: docRef.id, ...data };
  }

  async getData(collection: string, id?: string) {
    if (!this.db) {
      throw new Error('Firebase is not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
    }

    if (id) {
      const doc = await this.db.collection(collection).doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } else {
      const snapshot = await this.db.collection(collection).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  }

  async updateData(collection: string, id: string, data: any) {
    if (!this.db) {
      throw new Error('Firebase is not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
    }

    await this.db.collection(collection).doc(id).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id, ...data };
  }

  async deleteData(collection: string, id: string) {
    if (!this.db) {
      throw new Error('Firebase is not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
    }

    await this.db.collection(collection).doc(id).delete();
    return true;
  }

  async uploadFile(file: Buffer, filename: string, contentType: string) {
    if (!this.storage) {
      throw new Error('Firebase is not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
    }

    const bucket = this.storage.bucket();
    const fileRef = bucket.file(filename);
    
    await fileRef.save(file, {
      metadata: { contentType }
    });
    
    await fileRef.makePublic();
    return fileRef.publicUrl();
  }
}

// MongoDB-backed storage service
export class MongoDBStorageService implements StorageService {
  async saveData(collection: string, data: any): Promise<any> {
    const mongoService = new MongoDBService(collection);
    return await mongoService.saveData(data);
  }

  async getData(collection: string, id?: string): Promise<any> {
    const mongoService = new MongoDBService(collection);
    return await mongoService.getData(id);
  }

  async updateData(collection: string, id: string, data: any): Promise<any> {
    const mongoService = new MongoDBService(collection);
    return await mongoService.updateData(id, data);
  }

  async deleteData(collection: string, id: string): Promise<boolean> {
    const mongoService = new MongoDBService(collection);
    return await mongoService.deleteData(id);
  }

  async uploadFile(file: Buffer, filename: string, contentType: string): Promise<string> {
    throw new Error('File upload requires Supabase or Firebase to be configured.');
  }
}

// Default storage service - Priority: MongoDB > Supabase > Firebase > In-memory
let storageService: StorageService;
let mongoConnected = false;

// In-memory storage fallback
const memoryStore = new Map<string, any[]>();

const memoryStorageService: StorageService = {
  async saveData(collection: string, data: any) {
    const key = `storage_${collection}`;
    const existing = memoryStore.get(key) || [];
    const id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const item = { id, ...data };
    memoryStore.set(key, [...existing, item]);
    console.log(`[Memory] Saved to ${collection}:`, item.id);
    return item;
  },
  async getData(collection: string, id?: string) {
    const key = `storage_${collection}`;
    const data = memoryStore.get(key) || [];
    console.log(`[Memory] Get from ${collection}:`, id || 'all', 'count:', data.length);
    if (id) {
      return data.find((item: any) => item.id === id) || null;
    }
    return data;
  },
  async updateData(collection: string, id: string, data: any) {
    const key = `storage_${collection}`;
    const existing = memoryStore.get(key) || [];
    const index = existing.findIndex((item: any) => item.id === id);
    if (index >= 0) {
      existing[index] = { ...existing[index], ...data };
      memoryStore.set(key, existing);
      return existing[index];
    }
    throw new Error('Item not found');
  },
  async deleteData(collection: string, id: string) {
    const key = `storage_${collection}`;
    const existing = memoryStore.get(key) || [];
    memoryStore.set(key, existing.filter((item: any) => item.id !== id));
    return true;
  },
  async uploadFile(file: Buffer, filename: string, contentType: string) {
    throw new Error('File upload requires Supabase or Firebase to be configured.');
  }
};

async function initializeStorageService(): Promise<StorageService> {
  // Try MongoDB first (primary database)
  if (isMongoDBConfigured) {
    try {
      await connectToMongoDB();
      mongoConnected = true;
      console.log('Using MongoDB as primary storage');
      return new MongoDBStorageService();
    } catch (error) {
      console.error('MongoDB connection failed, falling back to other options:', error);
    }
  }

  // Try Supabase second - but verify tables exist
  if (supabase) {
    try {
      // Test if we can access Supabase by checking a table
      const { error } = await supabase.from('users').select('*').limit(1);
      if (error) {
        console.warn('Supabase tables not found, falling back to in-memory storage:', error.message);
      } else {
        console.log('Using Supabase as storage');
        return new SupabaseService(supabase);
      }
    } catch (supabaseError) {
      console.warn('Supabase connection test failed, falling back to in-memory:', supabaseError);
    }
  }

  // Try Firebase third
  if (firebaseDb && firebaseStorage) {
    console.log('Using Firebase as storage');
    return new FirebaseService(firebaseDb, firebaseStorage);
  }

  // Fallback to in-memory storage
  console.warn('No storage backend configured. Using in-memory storage.');
  return memoryStorageService;
}

// Initialize storage service asynchronously
initializeStorageService().then(service => {
  storageService = service;
  console.log('Storage service initialized successfully');
}).catch(error => {
  console.error('Failed to initialize storage service:', error);
});

// Export a getter to ensure we always get the initialized service
export async function getStorageService(): Promise<StorageService> {
  if (!storageService) {
    return await initializeStorageService();
  }
  return storageService;
}

// Export storage service for backward compatibility
export const storageServicePromise = initializeStorageService();
storageServicePromise.then(service => {
  storageService = service;
});

// Re-export storageService for direct usage (may be undefined initially)
export let storageServiceExport: StorageService;

// Update the exported storageService after initialization
initializeStorageService().then(service => {
  (global as any).storageServiceExport = service;
}).catch(error => {
  console.error('Storage initialization failed:', error);
});

// For backward compatibility, provide a default export
export { storageService as storage };

