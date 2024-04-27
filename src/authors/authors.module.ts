import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorResolver } from './authors.resolver';
import { PrismaService } from 'src/prisma.service';
import { AuthorsDAL } from './authors.dal';
import { BooksService } from 'src/books/books.service';
import { BooksDAL } from 'src/books/books.dal';
import { DataloaderModule } from 'src/dataloader/dataloader.module';
import { DataloaderService } from 'src/dataloader/dataloader.service';

@Module({
  imports: [],
  providers: [
    AuthorResolver,
    AuthorsService,
    PrismaService,
    AuthorsDAL,
    BooksService,
    BooksDAL,
    DataloaderService,
  ],
  exports: [AuthorsService],
})
export class AuthorsModule {}
