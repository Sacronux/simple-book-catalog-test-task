import { Injectable } from '@nestjs/common';
import { Author, Prisma } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';
import { graphqlInfoToPrismaSelect } from 'src/helpers/dataTransformer';
import { AuthorsDAL } from './authors.dal';
import * as DataLoader from 'dataloader';

type AuthorLoaderKey = {
  id: number;
  select?: Prisma.AuthorSelect;
};

@Injectable()
export class AuthorsService {
  private authorByIdLoader: DataLoader<AuthorLoaderKey, Author | null>;

  constructor(private authorsDAL: AuthorsDAL) {
    this.authorByIdLoader = new DataLoader<AuthorLoaderKey, Author | null>(
      async (keys) => {
        const ids = keys.map((key) => key.id);
        const results = await this.authorsDAL.findAuthorByIds(
          ids,
          keys[0].select,
        );
        const resultDict = new Map(
          ids.map((id, index) => [id, results[index] || null]),
        );
        return keys.map((key) => resultDict.get(key.id));
      },
      {
        cacheKeyFn: (key) => key,
      },
    );
  }

  async getAuthorById(
    id: number,
    info: GraphQLResolveInfo,
  ): Promise<Author | null> {
    const select: Prisma.AuthorSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;

    const author = await this.authorByIdLoader.load({ id, select });

    return author;
  }

  async createAuthor(
    data: Prisma.AuthorCreateInput,
    info: GraphQLResolveInfo,
  ): Promise<Author> {
    const select: Prisma.AuthorSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;

    const newAuthor = await this.authorsDAL.createAuthor(data, select);

    newAuthor.books = newAuthor.books || [];
    return newAuthor;
  }

  async getAuthors(
    info: GraphQLResolveInfo,
    filter?: {
      minNumberOfBooks?: number;
      maxNumberOfBooks?: number;
    },
  ): Promise<Author[]> {
    const select: Prisma.AuthorSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;

    // I'm using raw sql here because prisma is not supporting _count in where for relation fields
    // it's known issue - https://github.com/prisma/prisma/issues/8413
    if (filter?.maxNumberOfBooks && filter?.maxNumberOfBooks) {
      const authors = await this.authorsDAL.findAuthorsWithBookCount(
        filter.minNumberOfBooks,
        filter.maxNumberOfBooks,
        select,
      );

      return authors;
    }

    const authors = await this.authorsDAL.findAllAuthors(select);

    return authors.map((author) => {
      if (!author.books) {
        author.books = [];
      }
      return author;
    });
  }

  async deleteAuthor(id: number): Promise<number> {
    const deleteAuthor = await this.authorsDAL.deleteAuthor(id);
    return deleteAuthor ? 1 : 0;
  }

  async deleteAuthorWithBooks(id: number): Promise<number> {
    return await this.authorsDAL.deleteAuthorWithBooks(id);
  }
}
