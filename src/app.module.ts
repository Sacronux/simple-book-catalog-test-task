import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { GraphqlResolver } from './graphql/graphql.resolver';
import { GraphqlService } from './graphql/graphql.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      debug: true,
      playground: true, // Если вы используете Apollo Server 3, замените на Apollo Sandbox.
    }),
  ],
  providers: [GraphqlResolver, GraphqlService],
})
export class AppModule {}
