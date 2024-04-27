import { Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { IDataloaders } from './dataloader.interface';
import { BooksService } from 'src/books/books.service';
import { BookModel } from 'src/books/books.model';
import { AuthorsService } from 'src/authors/authors.service';
import { AuthorModel } from 'src/authors/authors.model';
import { GraphQLResolveInfo, introspectionFromSchema } from 'graphql';

@Injectable()
export class DataloaderService {
  constructor(
    private readonly booksService: BooksService,
    private readonly authorsService: AuthorsService,
  ) {}

  getLoaders(info: GraphQLResolveInfo): IDataloaders {
    const booksLoader = this._createBooksLoader(info);
    const authorsLoader = this._createAuthorsLoader(info);
    return {
      booksLoader,
      authorsLoader,
    };
  }

  private _createBooksLoader(info: GraphQLResolveInfo) {
    return new DataLoader<number, BookModel>(
      async (keys: readonly number[]) =>
        await this.booksService.getAuthorBooksByBatch(keys as number[], info),
    );
  }

  private _createAuthorsLoader(info: GraphQLResolveInfo) {
    return new DataLoader<number, AuthorModel>(
      async (keys: readonly number[]) =>
        await this.authorsService.getAuthorsByBatch(keys as number[], info),
    );
  }
}
