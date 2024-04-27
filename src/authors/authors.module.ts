import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorResolver } from './authors.resolver';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [],
  providers: [AuthorResolver, AuthorsService, PrismaService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
