import { Module } from '@nestjs/common';
import { BooksResolver } from './books.resolver';
import { BooksService } from './books.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [],
  providers: [BooksResolver, BooksService, PrismaService],
  exports: [BooksService],
})
export class BooksModule {}
