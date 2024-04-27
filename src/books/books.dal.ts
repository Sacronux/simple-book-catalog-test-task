import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Book, Prisma } from '@prisma/client';

@Injectable()
export class BooksDAL {
  constructor(private prisma: PrismaService) {}

  async findBooksByIds(
    ids: number[],
    select?: Prisma.BookSelect,
  ): Promise<Book[]> {
    const books = await this.prisma.book.findMany({
      where: { id: { in: ids } },
      select,
    });
    return books;
  }

  async findBooksByTitle(
    title: string,
    select?: Prisma.BookSelect,
  ): Promise<Book[]> {
    const books = await this.prisma.book.findMany({
      where: {
        title: {
          contains: title,
        },
      },
      select,
    });
    return books;
  }

  async getBookById(
    id: number,
    select?: Prisma.BookSelect,
  ): Promise<Book | null> {
    return this.prisma.book.findUnique({
      where: { id },
      select,
    });
  }

  async createBook(
    data: Prisma.BookCreateInput,
    select?: Prisma.BookSelect,
  ): Promise<Book> {
    return this.prisma.book.create({
      data,
      select,
    });
  }

  async updateBook(
    id: number,
    data: Prisma.BookUpdateInput,
    select: Prisma.BookSelect,
  ) {
    return this.prisma.book.update({
      where: { id },
      data,
      select,
    });
  }

  async deleteBook(id: number): Promise<Book> {
    return this.prisma.book.delete({
      where: { id },
    });
  }

  async getBooksByAuthorId(authorId: number, select: Prisma.BookSelect) {
    return this.prisma.book.findMany({
      where: {
        authors: {
          every: {
            id: authorId,
          },
        },
      },
      select,
    });
  }

  async getAllBooksByAuthorIds(authorIds: number[], select: Prisma.BookSelect) {
    console.log({ select });
    return this.prisma.book.findMany({
      where: {
        authors: {
          every: {
            id: {
              in: authorIds,
            },
          },
        },
      },
      select,
    });
  }
}
