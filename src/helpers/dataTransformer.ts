import { GraphQLResolveInfo } from 'graphql';
import * as graphqlFields from 'graphql-fields';

/**
 * Converts GraphQL info object to Prisma select query format.
 * @param info GraphQLResolveInfo from a GraphQL resolver function.
 * @returns Prisma select object with dynamic types.
 */
function graphqlInfoToPrismaSelect<T>(info: GraphQLResolveInfo): T {
  const fields = graphqlFields(info, {}, { processArguments: true });
  const select = buildSelectObject(fields);
  return select as T;
}

/**
 * Recursively builds a Prisma select object from fields extracted by graphql-fields.
 * @param fields Object containing fields requested in GraphQL query.
 * @returns Prisma select object.
 */
function buildSelectObject(fields: any): any {
  return Object.keys(fields).reduce((select, key) => {
    if (Object.keys(fields[key]).length > 0) {
      select[key] = { select: buildSelectObject(fields[key]) };
    } else {
      select[key] = true;
    }
    return select;
  }, {});
}

export { graphqlInfoToPrismaSelect };
