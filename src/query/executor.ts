import { Document, StorageEngine } from '../storage/engine';
import { QueryPlan, QueryOperation, QueryOperationType } from './planner';

export interface ExecutionResult {
  documents: Document[];
  executionTime: number;
  operationsExecuted: number;
}

export class QueryExecutor {
  private engine: StorageEngine;

  constructor(engine: StorageEngine) {
    this.engine = engine;
    console.log('[QueryExecutor] Initialized');
  }

  async execute(plan: QueryPlan): Promise<ExecutionResult> {
    const startTime = Date.now();
    let documents: Document[] = [];

    console.log(`[QueryExecutor] Executing plan with ${plan.operations.length} operations`);

    for (const operation of plan.operations) {
      documents = await this.executeOperation(operation, documents);
    }

    const executionTime = Date.now() - startTime;

    console.log(`[QueryExecutor] Execution completed in ${executionTime}ms, returned ${documents.length} documents`);

    return {
      documents,
      executionTime,
      operationsExecuted: plan.operations.length,
    };
  }

  private async executeOperation(
    operation: QueryOperation,
    inputDocuments: Document[]
  ): Promise<Document[]> {
    switch (operation.type) {
      case QueryOperationType.SCAN:
        return this.executeScan(operation);

      case QueryOperationType.FILTER:
        return this.executeFilter(operation, inputDocuments);

      case QueryOperationType.PROJECTION:
        return this.executeProjection(operation, inputDocuments);

      case QueryOperationType.SORT:
        return this.executeSort(operation, inputDocuments);

      case QueryOperationType.LIMIT:
        return this.executeLimit(operation, inputDocuments);

      case QueryOperationType.INDEX_LOOKUP:
        return this.executeIndexLookup(operation);

      default:
        console.log(`[QueryExecutor] Unknown operation type: ${operation.type}`);
        return inputDocuments;
    }
  }

  private async executeScan(operation: QueryOperation): Promise<Document[]> {
    if (!operation.collection) {
      return [];
    }

    console.log(`[QueryExecutor] Scanning collection: ${operation.collection}`);
    return this.engine.listDocuments(operation.collection);
  }

  private async executeFilter(
    operation: QueryOperation,
    documents: Document[]
  ): Promise<Document[]> {
    if (!operation.predicate) {
      return documents;
    }

    console.log(`[QueryExecutor] Filtering ${documents.length} documents`);
    return documents.filter(operation.predicate);
  }

  private async executeProjection(
    operation: QueryOperation,
    documents: Document[]
  ): Promise<Document[]> {
    if (!operation.fields || operation.fields.length === 0) {
      return documents;
    }

    console.log(`[QueryExecutor] Projecting fields: ${operation.fields.join(', ')}`);

    return documents.map(doc => {
      const projected: Document = { _id: doc._id };
      
      for (const field of operation.fields!) {
        if (field in doc) {
          projected[field] = doc[field];
        }
      }
      
      return projected;
    });
  }

  private async executeSort(
    operation: QueryOperation,
    documents: Document[]
  ): Promise<Document[]> {
    if (!operation.sortField) {
      return documents;
    }

    console.log(`[QueryExecutor] Sorting by ${operation.sortField} ${operation.sortOrder || 'asc'}`);

    const sorted = [...documents];
    const order = operation.sortOrder === 'desc' ? -1 : 1;

    sorted.sort((a, b) => {
      const aVal = a[operation.sortField!];
      const bVal = b[operation.sortField!];

      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });

    return sorted;
  }

  private async executeLimit(
    operation: QueryOperation,
    documents: Document[]
  ): Promise<Document[]> {
    if (!operation.limitCount) {
      return documents;
    }

    console.log(`[QueryExecutor] Limiting to ${operation.limitCount} documents`);
    return documents.slice(0, operation.limitCount);
  }

  private async executeIndexLookup(operation: QueryOperation): Promise<Document[]> {
    console.log('[QueryExecutor] Index lookup (placeholder for future index support)');
    return [];
  }
}
