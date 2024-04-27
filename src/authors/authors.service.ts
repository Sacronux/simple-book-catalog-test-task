import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Author, Prisma } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';
import { graphqlInfoToPrismaSelect } from 'src/helpers/dataTransformer';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async getAuthorById(
    id: number,
    info: GraphQLResolveInfo,
  ): Promise<Author | null> {
    const select: Prisma.AuthorSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;

    const author = await this.prisma.author.findUnique({
      where: { id },
      select,
    });

    if (author) {
      author.books = author.books || [];
    }

    return author;
  }

  async createAuthor(
    data: Prisma.AuthorCreateInput,
    info: GraphQLResolveInfo,
  ): Promise<Author> {
    const select: Prisma.AuthorSelect = info
      ? graphqlInfoToPrismaSelect(info)
      : undefined;

    const newAuthor = await this.prisma.author.create({
      data,
      select,
    });

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
      const authorsWithBooks: Author[] = await this.prisma.$queryRaw`
    SELECT a.id, COUNT(b.id) AS bookCount
    FROM \`Author\` a
    JOIN \`_BookAuthors\` ba ON a.id = ba.A
    JOIN \`Book\` b ON ba.B = b.id
    GROUP BY a.id, a.firstName, a.lastName
    HAVING bookCount BETWEEN ${filter.minNumberOfBooks} AND ${filter.maxNumberOfBooks}
  `;

      const authorsIds = authorsWithBooks.map(({ id }) => id);

      const authors = await this.prisma.author.findMany({
        where: {
          id: {
            in: authorsIds,
          },
        },
        select,
      });

      return authors;
    }

    const authors = await this.prisma.author.findMany({
      select,
    });

    return authors.map((author) => {
      if (!author.books) {
        author.books = [];
      }
      return author;
    });
  }

  async deleteAuthor(id: number): Promise<number> {
    const deleteAuthor = await this.prisma.author.delete({
      where: { id },
    });
    return deleteAuthor ? 1 : 0;
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
      (book) => book?.authors?.length === 1,
    );
    const booksToUpdate = author.books.filter(
      (book) => book?.authors?.length > 1,
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
