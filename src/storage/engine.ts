import { DocumentStore } from './documentStore';
import { IndexManager } from './indexManager';
import { TransactionManager } from './transactionManager';

export interface Document {
  _id: string;
  [key: string]: any;
}

export interface EngineConfig {
  enableIndexing?: boolean;
  enableTransactions?: boolean;
}

export class StorageEngine {
  private documentStore: DocumentStore;
  private indexManager: IndexManager;
  private transactionManager: TransactionManager;
  private config: EngineConfig;

  constructor(config: EngineConfig = {}) {
    this.config = config;
    this.documentStore = new DocumentStore();
    this.indexManager = new IndexManager();
    this.transactionManager = new TransactionManager();
    
    console.log('[StorageEngine] Initialized with config:', this.config);
  }

  async createDocument(collection: string, doc: Omit<Document, '_id'>): Promise<Document> {
    console.log(`[StorageEngine] Creating document in collection: ${collection}`);
    
    const document = await this.documentStore.create(collection, doc);
    
    if (this.config.enableIndexing) {
      await this.indexManager.indexDocument(collection, document);
    }
    
    return document;
  }

  async getDocument(collection: string, id: string): Promise<Document | null> {
    console.log(`[StorageEngine] Fetching document ${id} from collection: ${collection}`);
    return this.documentStore.get(collection, id);
  }

  async updateDocument(collection: string, id: string, updates: Partial<Document>): Promise<Document | null> {
    console.log(`[StorageEngine] Updating document ${id} in collection: ${collection}`);
    
    const document = await this.documentStore.update(collection, id, updates);
    
    if (document && this.config.enableIndexing) {
      await this.indexManager.reindexDocument(collection, document);
    }
    
    return document;
  }

  async deleteDocument(collection: string, id: string): Promise<boolean> {
    console.log(`[StorageEngine] Deleting document ${id} from collection: ${collection}`);
    
    const deleted = await this.documentStore.delete(collection, id);
    
    if (deleted && this.config.enableIndexing) {
      await this.indexManager.removeDocument(collection, id);
    }
    
    return deleted;
  }

  async listDocuments(collection: string): Promise<Document[]> {
    console.log(`[StorageEngine] Listing all documents in collection: ${collection}`);
    return this.documentStore.list(collection);
  }

  async collectionExists(collection: string): Promise<boolean> {
    return this.documentStore.hasCollection(collection);
  }

  async getCollections(): Promise<string[]> {
    return this.documentStore.getCollections();
  }

  async dropCollection(collection: string): Promise<boolean> {
    console.log(`[StorageEngine] Dropping collection: ${collection}`);
    
    if (this.config.enableIndexing) {
      await this.indexManager.dropCollectionIndexes(collection);
    }
    
    return this.documentStore.dropCollection(collection);
  }
}
