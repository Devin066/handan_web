import { GraphQLError } from 'graphql';
import { createYoga } from 'graphql-yoga';
import type { NextApiRequest, NextApiResponse } from 'next';
import { schema } from '@/server/schema';
import { createContext } from '@/server/context';

export const config = {
  api: {
    // Yoga reads the raw request itself.
    bodyParser: false,
  },
};

const isProduction = process.env.NODE_ENV === 'production';

/** Names that don't read right when simply lower-cased. */
const MODEL_LABELS: Record<string, string> = { Bom: 'BOM', Uom: 'unit of measure' };

export default createYoga<{ req: NextApiRequest; res: NextApiResponse }>({
  schema,
  context: createContext,
  graphqlEndpoint: '/api/graphql',

  /**
   * Errors raised deliberately are meant for the operator and go through intact
   * ("only 12 outstanding"). Anything else — a Prisma failure, a bug — is replaced
   * in production so table and column names never reach the browser, while the
   * real error is logged server-side. In development it passes through, because
   * masking it just makes debugging harder.
   */
  maskedErrors: {
    maskError(error) {
      const original = (error as { originalError?: Error })?.originalError;

      // Validation errors have no originalError; ours are GraphQLError by design.
      if (!original || original instanceof GraphQLError) {
        return error as Error;
      }

      // Prisma raises P2025 when a findFirstOrThrow/update matches nothing. That
      // is an ordinary "you asked for something that isn't there" — including a
      // record belonging to another company — not a server fault, so it gets a
      // clean message instead of being masked as an internal error.
      if ((original as { code?: string }).code === 'P2025') {
        const model = (original as { meta?: { modelName?: string } }).meta?.modelName;
        const label = model
          ? (MODEL_LABELS[model] ?? model.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase())
          : 'record';
        return new GraphQLError(`That ${label} no longer exists or isn't in your company. Refresh and try again.`, {
          extensions: { code: 'NOT_FOUND', model },
        });
      }

      if (!isProduction) {
        return error as Error;
      }

      console.error('[graphql] unexpected error:', original);

      return new GraphQLError('Internal server error', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    },
  },
});
