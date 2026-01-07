import { Document } from './engine';
import { randomUUID } from 'crypto';

export class DocumentStore {
  private collections: Map<string, Map<string, Document>>;

  constructor() {
    this.collections = new Map();
    console.log('[DocumentStore] Initialized');
  }

  async create(collection: string, doc: Omit<Document, '_id'>): Promise<Document> {
    if (!this.collections.has(collection)) {
      this.collections.set(collection, new Map());
      console.log(`[DocumentStore] Created new collection: ${collection}`);
    }

    const collectionMap = this.collections.get(collection)!;
    const id = randomUUID();
    const document: Document = { ...doc, _id: id };

    collectionMap.set(id, document);
    console.log(`[DocumentStore] Created document with id: ${id}`);

    return document;
  }

  async get(collection: string, id: string): Promise<Document | null> {
    const collectionMap = this.collections.get(collection);
    
    if (!collectionMap) {
      console.log(`[DocumentStore] Collection not found: ${collection}`);
      return null;
    }

    const document = collectionMap.get(id);
    
    if (!document) {
      console.log(`[DocumentStore] Document not found: ${id}`);
      return null;
    }

    return { ...document };
  }

  async update(collection: string, id: string, updates: Partial<Document>): Promise<Document | null> {
    const collectionMap = this.collections.get(collection);
    
    if (!collectionMap) {
      console.log(`[DocumentStore] Collection not found: ${collection}`);
      return null;
    }

    const existing = collectionMap.get(id);
    
    if (!existing) {
      console.log(`[DocumentStore] Document not found: ${id}`);
      return null;
    }

    const updatedDoc: Document = { ...existing, ...updates, _id: id };
    collectionMap.set(id, updatedDoc);
    
    console.log(`[DocumentStore] Updated document: ${id}`);
    return { ...updatedDoc };
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const collectionMap = this.collections.get(collection);
    
    if (!collectionMap) {
      console.log(`[DocumentStore] Collection not found: ${collection}`);
      return false;
    }

    const deleted = collectionMap.delete(id);
    console.log(`[DocumentStore] Delete result for ${id}: ${deleted}`);
    
    return deleted;
  }

  async list(collection: string): Promise<Document[]> {
    const collectionMap = this.collections.get(collection);
    
    if (!collectionMap) {
      console.log(`[DocumentStore] Collection not found: ${collection}`);
      return [];
    }

    const documents = Array.from(collectionMap.values()).map(doc => ({ ...doc }));
    console.log(`[DocumentStore] Listed ${documents.length} documents from ${collection}`);
    
    return documents;
  }

  async hasCollection(collection: string): Promise<boolean> {
    return this.collections.has(collection);
  }

  async getCollections(): Promise<string[]> {
    return Array.from(this.collections.keys());
  }

  async dropCollection(collection: string): Promise<boolean> {
    const deleted = this.collections.delete(collection);
    console.log(`[DocumentStore] Dropped collection ${collection}: ${deleted}`);
    return deleted;
  }

  async clear(): Promise<void> {
    this.collections.clear();
    console.log('[DocumentStore] Cleared all collections');
  }
}
