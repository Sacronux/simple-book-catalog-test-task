import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorResolver } from './authors.resolver';
import { PrismaService } from 'src/prisma.service';
import { AuthorsDAL } from './authors.dal';

@Module({
  imports: [],
  providers: [AuthorResolver, AuthorsService, PrismaService, AuthorsDAL],
  exports: [AuthorsService],
})
export class AuthorsModule {}
