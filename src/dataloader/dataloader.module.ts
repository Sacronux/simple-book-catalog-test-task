import { Module } from '@nestjs/common';
import { DataloaderService } from './dataloader.service';
import { BooksModule } from 'src/books/books.module';
import { AuthorsModule } from 'src/authors/authors.module';

@Module({
  imports: [BooksModule, AuthorsModule],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
