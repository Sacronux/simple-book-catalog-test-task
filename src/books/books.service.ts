import { Injectable, Scope } from '@nestjs/common';
import { Book, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import * as DataLoader from 'dataloader';
import { BookInput, BookModel } from './books.model';
import { graphqlInfoToPrismaSelect } from 'src/helpers/dataTransformer';
import { GraphQLResolveInfo } from 'graphql';
import { BooksDAL } from './books.dal';

type BookBatchParams = {
  id: number;
  select?: Prisma.BookSelect;
};

type TitleBatchParams = {
  title: string;
  select?: Prisma.BookSelect;
};

@Injectable({ scope: Scope.REQUEST })
export class BooksService {
  private bookByIdLoader: DataLoader<BookBatchParams, Book | null>;
  private booksByTitleLoader: DataLoader<TitleBatchParams, Book[]>;

  constructor(private prisma: PrismaService, private booksDAL: BooksDAL) {
    this.bookByIdLoader = new DataLoader<BookBatchParams, Book | null>(
      async (params) => {
        const ids = params.map((param) => param.id);
        const select = params[0].select; // Assumes select is consistent across all batched requests

        const books = await this.booksDAL.findBooksByIds(ids, select);
        const booksMap = new Map(books.map((book) => [book.id, book]));
        return params.map((param) => booksMap.get(param.id) || null);
      },
      {
        cacheKeyFn: (key) => key,
      },
    );

    this.booksByTitleLoader = new DataLoader<TitleBatchParams, Book[]>(
      async (params) => {
        // Map to store books by title for efficient lookup
        const booksByTitleMap = new Map<string, Book[]>();

        // Loop through each parameter to handle each title query individually
        for (const param of params) {
          // Fetch books by title using the provided DAL method
          const books = await this.booksDAL.findBooksByTitle(
            param.title,
            param.select,
          );

          // If the title is already in the map (due to DataLoader batching), merge the results
          if (booksByTitleMap.has(param.title)) {
            booksByTitleMap.get(param.title).push(...books);
          } else {
            booksByTitleMap.set(param.title, books);
          }
        }

        // Return the results in the order they were requested
        return params.map((param) => booksByTitleMap.get(param.title) || []);
      },
      {
        cacheKeyFn: (key) => key,
      },
    );
  }

  async getBookById(
    id: number,
    info: GraphQLResolveInfo,
  ): Promise<Book | null> {
    const select: Prisma.BookSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;
    const book = await this.bookByIdLoader.load({ id, select });
    return book;
  }

  async getBooksByTitle(
    info: GraphQLResolveInfo,
    title: string,
  ): Promise<Book[]> {
    const select: Prisma.BookSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;
    const books = await this.booksByTitleLoader.load({ title, select });
    return books;
  }

  async addAuthorToBook(
    bookId: number,
    authorId: number,
    info: GraphQLResolveInfo,
  ): Promise<BookModel> {
    const select: Prisma.BookSelect = graphqlInfoToPrismaSelect(info);

    const authorExists = await this.prisma.author.findUnique({
      where: { id: authorId },
    });
    const bookExists = await this.booksDAL.getBookById(bookId);

    if (!authorExists || !bookExists) {
      throw new Error('Author or Book not found.');
    }

    const updatedBook = await this.booksDAL.updateBook(
      bookId,
      {
        authors: {
          connect: { id: authorId },
        },
      },
      select,
    );

    if (!updatedBook.authors) {
      throw new Error('Failed to retrieve authors for the book.');
    }

    return updatedBook as unknown as BookModel;
  }

  async createBook(
    bookInput: BookInput,
    info: GraphQLResolveInfo,
  ): Promise<Book> {
    const select: Prisma.BookSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;

    return this.booksDAL.createBook(
      {
        title: bookInput.title,
        authors: {
          connect: bookInput.authorIds.map((authorId) => ({
            id: Number(authorId),
          })),
        },
      },
      select,
    );
  }

  async deleteBook(id: number): Promise<number> {
    const deleteResponse = await this.booksDAL.deleteBook(id);
    return deleteResponse ? 1 : 0;
  }
}
