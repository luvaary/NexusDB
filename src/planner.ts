import { Document } from '../storage/engine';

export enum QueryOperationType {
  SCAN = 'SCAN',
  INDEX_LOOKUP = 'INDEX_LOOKUP',
  FILTER = 'FILTER',
  PROJECTION = 'PROJECTION',
  SORT = 'SORT',
  LIMIT = 'LIMIT',
}

export interface QueryOperation {
  type: QueryOperationType;
  collection?: string;
  field?: string;
  value?: any;
  predicate?: (doc: Document) => boolean;
  fields?: string[];
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  limitCount?: number;
}

export interface QueryPlan {
  operations: QueryOperation[];
  estimatedCost: number;
  useIndex: boolean;
}

export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

export class QueryPlanner {
  constructor() {
    console.log('[QueryPlanner] Initialized');
  }

  async createPlan(
    collection: string,
    filters?: QueryFilter[],
    projection?: string[],
    sort?: { field: string; order: 'asc' | 'desc' },
    limit?: number
  ): Promise<QueryPlan> {
    const operations: QueryOperation[] = [];
    let estimatedCost = 1;
    let useIndex = false;

    operations.push({
      type: QueryOperationType.SCAN,
      collection,
    });

    if (filters && filters.length > 0) {
      for (const filter of filters) {
        operations.push({
          type: QueryOperationType.FILTER,
          field: filter.field,
          value: filter.value,
          predicate: this.createPredicate(filter),
        });
        estimatedCost += 0.5;
      }
    }

    if (projection && projection.length > 0) {
      operations.push({
        type: QueryOperationType.PROJECTION,
        fields: projection,
      });
      estimatedCost += 0.2;
    }

    if (sort) {
      operations.push({
        type: QueryOperationType.SORT,
        sortField: sort.field,
        sortOrder: sort.order,
      });
      estimatedCost += 1;
    }

    if (limit) {
      operations.push({
        type: QueryOperationType.LIMIT,
        limitCount: limit,
      });
    }

    console.log(`[QueryPlanner] Created plan with ${operations.length} operations, estimated cost: ${estimatedCost}`);

    return {
      operations,
      estimatedCost,
      useIndex,
    };
  }

  private createPredicate(filter: QueryFilter): (doc: Document) => boolean {
    return (doc: Document) => {
      const fieldValue = doc[filter.field];

      switch (filter.operator) {
        case 'eq':
          return fieldValue === filter.value;
        case 'ne':
          return fieldValue !== filter.value;
        case 'gt':
          return fieldValue > filter.value;
        case 'gte':
          return fieldValue >= filter.value;
        case 'lt':
          return fieldValue < filter.value;
        case 'lte':
          return fieldValue <= filter.value;
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(fieldValue);
        case 'contains':
          return String(fieldValue).includes(String(filter.value));
        default:
          return true;
      }
    };
  }

  async optimizePlan(plan: QueryPlan): Promise<QueryPlan> {
    console.log('[QueryPlanner] Optimizing plan (placeholder for future optimization)');
    return plan;
  }
}
