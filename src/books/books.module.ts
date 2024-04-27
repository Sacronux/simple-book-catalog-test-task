import { Module } from '@nestjs/common';
import { BooksResolver } from './books.resolver';
import { BooksService } from './books.service';
import { PrismaService } from 'src/prisma.service';
import { BooksDAL } from './books.dal';

@Module({
  imports: [],
  providers: [BooksResolver, BooksService, PrismaService, BooksDAL],
  exports: [BooksService],
})
export class BooksModule {}
