import { Injectable, Scope } from '@nestjs/common';
import { Author, Book, Prisma } from '@prisma/client';
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
  constructor(private prisma: PrismaService, private booksDAL: BooksDAL) {}

  async getBookById(
    id: number,
    info: GraphQLResolveInfo,
  ): Promise<Book | null> {
    const select: Prisma.BookSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;
    const book = await this.booksDAL.getBookById(id, select);
    return book;
  }

  async getBooksByAuthorId(authorId: number, info: GraphQLResolveInfo) {
    const select: Prisma.BookSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;
    const books = await this.booksDAL.getBooksByAuthorId(authorId, select);
    return books;
  }

  public async getAllBooksByAuthorIds(
    authorIds: number[],
    info: GraphQLResolveInfo,
  ) {
    const select: Prisma.BookSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;
    return await this.booksDAL.getAllBooksByAuthorIds(authorIds, select);
  }

  public async getAuthorBooksByBatch(
    authorIds: number[],
    info: GraphQLResolveInfo,
  ): Promise<(Book | any)[]> {
    const books = await this.getAllBooksByAuthorIds(authorIds, info);

    const mappedResults = this._mapResultToIds(authorIds, books);
    return mappedResults;
  }

  private _mapResultToIds(
    authorIds: readonly number[],
    books: (Book & { authors: Author[] })[],
  ) {
    return authorIds.map(() => books || null);
  }

  async getBooksByTitle(
    info: GraphQLResolveInfo,
    title: string,
  ): Promise<Book[]> {
    const select: Prisma.BookSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;
    const books = await this.booksDAL.findBooksByTitle(title, select);
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
