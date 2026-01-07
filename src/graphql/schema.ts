export const typeDefs = `
  scalar JSON

  type Document {
    _id: String!
    data: JSON!
  }

  type Query {
    getDocument(collection: String!, id: String!): Document
    listDocuments(collection: String!): [Document!]!
    getCollections: [String!]!
  }

  type Mutation {
    createDocument(collection: String!, doc: JSON!): Document!
    updateDocument(collection: String!, id: String!, doc: JSON!): Document
    deleteDocument(collection: String!, id: String!): Boolean!
    dropCollection(collection: String!): Boolean!
  }

  type ExecutionStats {
    executionTime: Int!
    operationsExecuted: Int!
    documentsReturned: Int!
  }

  input QueryFilter {
    field: String!
    operator: String!
    value: JSON!
  }

  input QueryOptions {
    filters: [QueryFilter!]
    projection: [String!]
    sort: SortOptions
    limit: Int
  }

  input SortOptions {
    field: String!
    order: String!
  }

  type QueryResult {
    documents: [Document!]!
    stats: ExecutionStats!
  }

  extend type Query {
    queryDocuments(collection: String!, options: QueryOptions): QueryResult!
  }
`;
