import { OnModuleInit } from '@nestjs/common';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  GraphQLRequestContext,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { GraphQLError, GraphQLSchema } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin, OnModuleInit {
  private schema: GraphQLSchema;

  constructor(private readonly schemaHost: GraphQLSchemaHost) {}

  onModuleInit() {
    this.schema = this.schemaHost.schema;
  }

  async requestDidStart(): Promise<GraphQLRequestListener> {
    const maxComplexity = 15;

    const schema = this.schemaHost.schema;

    if (!schema) {
      console.error('GraphQL schema is not available at request start.');
      throw new Error('GraphQL schema is not available.');
    }

    return {
      async didResolveOperation(context: GraphQLRequestContext) {
        const { request, document } = context;
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });
        console.log({ complexity });
        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`,
          );
        }
        console.log('Query Complexity:', complexity);
      },
    };
  }
}
