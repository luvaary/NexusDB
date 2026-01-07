import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { StorageEngine } from './storage/engine';
import { QueryPlanner } from './query/planner';
import { QueryExecutor } from './query/executor';
import { typeDefs } from './graphql/schema';
import { createResolvers } from './graphql/resolvers';
import { createLogger, LogLevel } from './utils/logger';

const logger = createLogger('NexusDB', LogLevel.INFO);

async function main() {
  logger.info('Starting NexusDB...');

  const engine = new StorageEngine({
    enableIndexing: false,
    enableTransactions: false,
  });

  const planner = new QueryPlanner();
  const executor = new QueryExecutor(engine);

  const resolvers = createResolvers(engine, planner, executor);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  logger.info(`NexusDB GraphQL API ready at ${url}`);
  logger.info('Available operations:');
  logger.info('  Queries: getDocument, listDocuments, getCollections, queryDocuments');
  logger.info('  Mutations: createDocument, updateDocument, deleteDocument, dropCollection');
}

main().catch((error) => {
  logger.error('Failed to start NexusDB', { error: error.message });
  process.exit(1);
});
