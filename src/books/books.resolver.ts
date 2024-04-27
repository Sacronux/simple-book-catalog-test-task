import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Info,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { BooksService } from './books.service';
import { BookModel, BookInput } from './books.model';
import { GraphQLResolveInfo } from 'graphql';
import { AuthorModel } from 'src/authors/authors.model';
import { DataloaderService } from 'src/dataloader/dataloader.service';

@Resolver(() => BookModel)
export class BooksResolver {
  constructor(
    private readonly booksService: BooksService,
    private loaderService: DataloaderService,
  ) {}

  @Query(() => BookModel, { nullable: true })
  getBook(
    @Args('id', { type: () => Int }) id: number,
    @Info()
    info: GraphQLResolveInfo,
  ) {
    return this.booksService.getBookById(id, info);
  }

  @Query(() => [BookModel], { nullable: 'itemsAndList' })
  getBooks(
    @Info()
    info: GraphQLResolveInfo,
    @Args('title', { type: () => String, nullable: true }) title?: string,
  ) {
    return this.booksService.getBooksByTitle(info, title);
  }

  @ResolveField('authors', () => [AuthorModel])
  async getAuthors(
    @Parent() book: BookModel,
    @Info()
    info: GraphQLResolveInfo,
  ) {
    const { id: bookId } = book;
    const { authorsLoader } = this.loaderService.getLoaders(info);
    return await authorsLoader.load(bookId);
  }

  @Mutation(() => BookModel)
  createBook(
    @Args('book') bookInput: BookInput,
    @Info()
    info: GraphQLResolveInfo,
  ) {
    return this.booksService.createBook(bookInput, info);
  }

  @Mutation(() => Int)
  deleteBook(@Args('id', { type: () => Int }) id: number) {
    return this.booksService.deleteBook(id);
  }

  @Mutation(() => BookModel)
  addAuthorToBook(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Args('authorId', { type: () => Int }) authorId: number,
    @Info()
    info: GraphQLResolveInfo,
  ): Promise<BookModel> {
    return this.booksService.addAuthorToBook(bookId, authorId, info);
  }
}
