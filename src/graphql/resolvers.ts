import { GraphQLScalarType, Kind } from 'graphql';
import { StorageEngine } from '../storage/engine';
import { QueryPlanner, QueryFilter as PlannerQueryFilter } from '../query/planner';
import { QueryExecutor } from '../query/executor';

interface QueryFilter {
  field: string;
  operator: string;
  value: any;
}

interface SortOptions {
  field: string;
  order: string;
}

interface QueryOptions {
  filters?: QueryFilter[];
  projection?: string[];
  sort?: SortOptions;
  limit?: number;
}

const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      return parseObject(ast);
    }
    if (ast.kind === Kind.LIST) {
      return ast.values.map(parseValue);
    }
    return parseValue(ast);
  },
});

function parseValue(ast: any): any {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT:
      return parseObject(ast);
    case Kind.LIST:
      return ast.values.map(parseValue);
    case Kind.NULL:
      return null;
    default:
      return null;
  }
}

function parseObject(ast: any): any {
  const obj: any = {};
  ast.fields.forEach((field: any) => {
    obj[field.name.value] = parseValue(field.value);
  });
  return obj;
}

export function createResolvers(engine: StorageEngine, planner: QueryPlanner, executor: QueryExecutor) {
  return {
    JSON: JSONScalar,

    Query: {
      async getDocument(_: any, { collection, id }: { collection: string; id: string }) {
        console.log(`[Resolver] getDocument called: ${collection}/${id}`);
        const doc = await engine.getDocument(collection, id);
        
        if (!doc) {
          return null;
        }

        const { _id, ...data } = doc;
        return { _id, data };
      },

      async listDocuments(_: any, { collection }: { collection: string }) {
        console.log(`[Resolver] listDocuments called: ${collection}`);
        const docs = await engine.listDocuments(collection);
        
        return docs.map(doc => {
          const { _id, ...data } = doc;
          return { _id, data };
        });
      },

      async getCollections() {
        console.log('[Resolver] getCollections called');
        return engine.getCollections();
      },

      async queryDocuments(_: any, { collection, options }: { collection: string; options?: QueryOptions }) {
        console.log(`[Resolver] queryDocuments called: ${collection}`);
        
        const filters = options?.filters?.map(f => ({
          field: f.field,
          operator: f.operator as any,
          value: f.value,
        } as PlannerQueryFilter));

        const sort = options?.sort ? {
          field: options.sort.field,
          order: options.sort.order as 'asc' | 'desc',
        } : undefined;

        const plan = await planner.createPlan(
          collection,
          filters,
          options?.projection,
          sort,
          options?.limit
        );

        const result = await executor.execute(plan);

        return {
          documents: result.documents.map(doc => {
            const { _id, ...data } = doc;
            return { _id, data };
          }),
          stats: {
            executionTime: result.executionTime,
            operationsExecuted: result.operationsExecuted,
            documentsReturned: result.documents.length,
          },
        };
      },
    },

    Mutation: {
      async createDocument(_: any, { collection, doc }: { collection: string; doc: any }) {
        console.log(`[Resolver] createDocument called: ${collection}`);
        const created = await engine.createDocument(collection, doc);
        const { _id, ...data } = created;
        return { _id, data };
      },

      async updateDocument(_: any, { collection, id, doc }: { collection: string; id: string; doc: any }) {
        console.log(`[Resolver] updateDocument called: ${collection}/${id}`);
        const updated = await engine.updateDocument(collection, id, doc);
        
        if (!updated) {
          return null;
        }

        const { _id, ...data } = updated;
        return { _id, data };
      },

      async deleteDocument(_: any, { collection, id }: { collection: string; id: string }) {
        console.log(`[Resolver] deleteDocument called: ${collection}/${id}`);
        return engine.deleteDocument(collection, id);
      },

      async dropCollection(_: any, { collection }: { collection: string }) {
        console.log(`[Resolver] dropCollection called: ${collection}`);
        return engine.dropCollection(collection);
      },
    },
  };
}
