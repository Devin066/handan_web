import fs from 'node:fs';
import path from 'node:path';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from './resolvers';

const typeDefs = fs.readFileSync(path.join(process.cwd(), 'src/server/schema.graphql'), 'utf8');

export const schema = makeExecutableSchema({ typeDefs, resolvers });
