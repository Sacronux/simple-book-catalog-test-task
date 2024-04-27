import { Injectable } from '@nestjs/common';
import { Book, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { BookInput, BookModel } from './books.model';
import { graphqlInfoToPrismaSelect } from 'src/helpers/dataTransformer';
import { GraphQLResolveInfo } from 'graphql';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async getBookById(
    id: number,
    info: GraphQLResolveInfo,
  ): Promise<Book | null> {
    const select: Prisma.BookSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;

    return this.prisma.book.findUnique({
      where: { id },
      select,
    });
  }

  async getBooksByTitle(
    info: GraphQLResolveInfo,
    title?: string,
  ): Promise<Book[]> {
    const select: Prisma.BookSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;

    if (!title) {
      return this.prisma.book.findMany({
        select,
      });
    }
    return this.prisma.book.findMany({
      where: {
        title: {
          contains: title,
        },
      },
      select,
    });
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
    const bookExists = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!authorExists || !bookExists) {
      throw new Error('Author or Book not found.');
    }

    const updatedBook = await this.prisma.book.update({
      where: { id: bookId },
      data: {
        authors: {
          connect: { id: authorId },
        },
      },
      select,
    });

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

    return this.prisma.book.create({
      data: {
        title: bookInput.title,
        authors: {
          connect: bookInput.authorIds.map((authorId) => ({
            id: Number(authorId),
          })),
        },
      },
      select,
    });
  }

  async deleteBook(id: number): Promise<number> {
    const deleteResponse = await this.prisma.book.delete({
      where: { id },
    });
    return deleteResponse ? 1 : 0;
  }
}
