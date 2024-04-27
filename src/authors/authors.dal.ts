import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Author, Prisma } from '@prisma/client';

@Injectable()
export class AuthorsDAL {
  constructor(private prisma: PrismaService) {}

  async findAuthorById(id: number, select?: Prisma.AuthorSelect) {
    return this.prisma.author.findUnique({
      where: { id },
      select,
    });
  }

  async findAuthorByIds(ids: number[], select?: Prisma.AuthorSelect) {
    return this.prisma.author.findMany({
      where: { id: { in: ids } },
      select,
    });
  }

  async createAuthor(
    data: Prisma.AuthorCreateInput,
    select?: Prisma.AuthorSelect,
  ) {
    return this.prisma.author.create({
      data,
      select,
    });
  }

  async findAllAuthors(select?: Prisma.AuthorSelect) {
    return this.prisma.author.findMany({ select });
  }

  async findAuthorsWithBookCount(
    minBooks: number,
    maxBooks: number,
    select?: Prisma.AuthorSelect,
  ): Promise<Author[]> {
    const authorsWithBooks: Author[] = await this.prisma.$queryRaw`
            SELECT a.id, COUNT(b.id) AS bookCount
            FROM \`Author\` a
            JOIN \`_BookAuthors\` ba ON a.id = ba.A
            JOIN \`Book\` b ON ba.B = b.id
            GROUP BY a.id, a.firstName, a.lastName
            HAVING bookCount BETWEEN ${minBooks} AND ${maxBooks}
        `;
    const authorIds = authorsWithBooks.map((author) => author.id);
    return this.prisma.author.findMany({
      where: { id: { in: authorIds } },
      select,
    });
  }

  async deleteAuthor(id: number): Promise<number> {
    await this.prisma.author.delete({
      where: { id },
    });
    return 1;
  }

  async deleteAuthorWithBooks(id: number): Promise<number> {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: {
        books: {
          include: {
            authors: true,
          },
        },
      },
    });
    if (!author) return 0;

    const booksToDelete = author.books.filter(
      (book) => book.authors.length === 1,
    );
    const booksToUpdate = author.books.filter(
      (book) => book.authors.length > 1,
    );

    await this.prisma.book.deleteMany({
      where: {
        id: {
          in: booksToDelete.map((book) => book.id),
        },
      },
    });

    for (const book of booksToUpdate) {
      await this.prisma.book.update({
        where: { id: book.id },
        data: {
          authors: {
            disconnect: { id: author.id },
          },
        },
      });
    }

    await this.prisma.author.delete({
      where: { id },
    });

    return 1 + booksToDelete.length + booksToUpdate.length;
  }
}
