import { Module } from '@nestjs/common';
import { BooksResolver } from './books.resolver';
import { BooksService } from './books.service';
import { PrismaService } from 'src/prisma.service';
import { BooksDAL } from './books.dal';
import { DataloaderService } from 'src/dataloader/dataloader.service';
import { AuthorsService } from 'src/authors/authors.service';
import { AuthorsDAL } from 'src/authors/authors.dal';

@Module({
  imports: [],
  providers: [
    BooksResolver,
    BooksService,
    PrismaService,
    BooksDAL,
    DataloaderService,
    AuthorsService,
    AuthorsDAL,
  ],
  exports: [BooksService],
})
export class BooksModule {}
