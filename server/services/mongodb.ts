import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rachamadgu19_db_user:BLxr1sCB23oKSsa7-pass@cluster.mongodb.net/entresst?retryWrites=true&w=majority';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'entresst';

let client: MongoClient | null = null;
let db: Db | null = null;

// Initialize MongoDB connection
export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(MONGO_DB_NAME);
    console.log('Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Get the database instance
export function getDatabase(): Db {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectToMongoDB() first.');
  }
  return db;
}

// Get a collection
export function getCollection<T extends Document>(name: string): Collection<T> {
  return getDatabase().collection<T>(name);
}

// Close connection
export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

// MongoDB Service class implementing the StorageService interface
export class MongoDBService {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  private get collection(): Collection<any> {
    return getCollection<any>(this.collectionName);
  }

  async saveData(data: any): Promise<any> {
    try {
      const doc = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await this.collection.insertOne(doc);
      return { id: result.insertedId.toString(), ...data };
    } catch (error) {
      console.error(`MongoDB save error (${this.collectionName}):`, error);
      throw new Error(`Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getData(id?: string): Promise<any> {
    try {
      if (id) {
        // Try to parse as ObjectId, if it fails try as string id field
        try {
          const objectId = new ObjectId(id);
          const doc = await this.collection.findOne({ _id: objectId });
          if (!doc) return null;
          return { id: doc._id.toString(), ...doc };
        } catch {
          // If not a valid ObjectId, search by id field
          const doc = await this.collection.findOne({ id: id });
          if (!doc) return null;
          return { id: doc._id.toString(), ...doc };
        }
      } else {
        // Get all documents - fix to properly return array
        const cursor = this.collection.find({});
        const docs = await cursor.toArray();
        if (!docs || docs.length === 0) {
          return [];
        }
        return docs.map(doc => ({
          id: doc._id.toString(),
          ...doc,
          createdAt: doc.createdAt?.toISOString(),
          updatedAt: doc.updatedAt?.toISOString()
        }));
      }
    } catch (error) {
      console.error(`MongoDB get error (${this.collectionName}):`, error);
      // Return empty array instead of throwing for getData
      return [];
    }
  }

  async updateData(id: string, data: any): Promise<any> {
    try {
      const objectId = new ObjectId(id);
      const result = await this.collection.findOneAndUpdate(
        { _id: objectId },
        { $set: { ...data, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        throw new Error('Document not found');
      }
      
      return { id: result._id.toString(), ...result };
    } catch (error) {
      console.error(`MongoDB update error (${this.collectionName}):`, error);
      throw new Error(`Failed to update data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteData(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      const result = await this.collection.deleteOne({ _id: objectId });
      return result.deletedCount === 1;
    } catch (error) {
      console.error(`MongoDB delete error (${this.collectionName}):`, error);
      throw new Error(`Failed to delete data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadFile(file: Buffer, filename: string, contentType: string): Promise<string> {
    // For file uploads, we'll store in GridFS or use Supabase storage
    throw new Error('File upload not implemented in MongoDB. Use Supabase storage instead.');
  }

  // Find documents by query
  async find(query: any): Promise<any[]> {
    try {
      const cursor = this.collection.find(query);
      const docs = await cursor.toArray();
      return docs.map(doc => ({
        id: doc._id.toString(),
        ...doc,
        createdAt: doc.createdAt?.toISOString(),
        updatedAt: doc.updatedAt?.toISOString()
      }));
    } catch (error) {
      console.error(`MongoDB find error (${this.collectionName}):`, error);
      throw new Error(`Failed to find data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Find one document
  async findOne(query: any): Promise<any | null> {
    try {
      const doc = await this.collection.findOne(query);
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        ...doc,
        createdAt: doc.createdAt?.toISOString(),
        updatedAt: doc.updatedAt?.toISOString()
      };
    } catch (error) {
      console.error(`MongoDB findOne error (${this.collectionName}):`, error);
      throw new Error(`Failed to find data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Check if MongoDB is configured
export const isMongoDBConfigured = !!MONGO_URI;

export { client, db };

