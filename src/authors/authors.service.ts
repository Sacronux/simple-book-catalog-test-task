import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Author, Prisma } from '@prisma/client';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async getAuthorById(id: number): Promise<Author | null> {
    return this.prisma.author.findUnique({
      where: { id },
    });
  }

  async createAuthor(data: Prisma.AuthorCreateInput): Promise<Author> {
    return this.prisma.author.create({
      data,
    });
  }

  async getAuthors(filter?: {
    minNumberOfBooks?: number;
    maxNumberOfBooks?: number;
  }): Promise<Author[]> {
    // had to write raw SQL here, since Prisma is not supporting _count field on the relation field where query
    const authors = await this.prisma.$queryRaw`
    SELECT a.id, a.firstName, a.lastName, COUNT(b.id) AS bookCount
    FROM Authors a
    JOIN BookAuthors ba ON a.id = ba.authorId
    JOIN Books b ON ba.bookId = b.id
    GROUP BY a.id, a.firstName, a.lastName
    HAVING bookCount BETWEEN ${filter.minNumberOfBooks} AND ${filter.maxNumberOfBooks}
  `;

    return authors as Author[];
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
