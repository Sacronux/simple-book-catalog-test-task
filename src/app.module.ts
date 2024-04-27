import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthorsModule } from './authors/authors.module';
import { BooksModule } from './books/books.module';
import { ComplexityPlugin } from './plugins/queryComplexityPlugin';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: async () => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
        sortSchema: true,
        playground: true,
        path: '/api/graphql',
      }),
    }),
    AuthorsModule,
    BooksModule,
  ],
  providers: [ComplexityPlugin],
})
export class AppModule {}
