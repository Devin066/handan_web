import { GraphQLScalarType, Kind } from 'graphql';
import { DateTimeResolver, JSONResolver } from 'graphql-scalars';

/**
 * Prisma hands back Decimal objects. The UI renders these straight into tables and
 * runs lodash.round over them, so they go out as plain JSON numbers.
 */
export const DecimalResolver = new GraphQLScalarType({
  name: 'Decimal',
  description: 'Fixed-precision number, serialized as a JSON number.',
  serialize(value) {
    if (value === null || value === undefined) return null;
    return Number(value.toString());
  },
  parseValue(value) {
    if (value === null || value === undefined) return null;
    return Number(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT || ast.kind === Kind.FLOAT) return Number(ast.value);
    if (ast.kind === Kind.STRING) return Number(ast.value);
    return null;
  },
});

export const scalarResolvers = {
  DateTime: DateTimeResolver,
  Decimal: DecimalResolver,
  JSON: JSONResolver,
};
