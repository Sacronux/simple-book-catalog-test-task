import DataLoader from 'dataloader';
import { AuthorModel } from 'src/authors/authors.model';
import { BookModel } from 'src/books/books.model';

export interface IDataloaders {
  booksLoader: DataLoader<number, BookModel>;
  authorsLoader: DataLoader<number, AuthorModel>;
}
