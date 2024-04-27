import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Info,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { AuthorModel, AuthorInput } from './authors.model';
import { AuthorsService } from './authors.service';
import { GraphQLResolveInfo } from 'graphql';
import { BookModel } from 'src/books/books.model';
import { DataloaderService } from 'src/dataloader/dataloader.service';

@Resolver(() => AuthorModel)
export class AuthorResolver {
  constructor(
    private authorService: AuthorsService,
    private loaderService: DataloaderService,
  ) {}

  @Query(() => AuthorModel, { nullable: true })
  getAuthor(
    @Args('id', { type: () => Int }) id: number,
    @Info()
    info: GraphQLResolveInfo,
  ) {
    return this.authorService.getAuthorById(id, info);
  }

  @ResolveField('books', () => [BookModel])
  async getBooks(
    @Parent() author: AuthorModel,
    @Info()
    info: GraphQLResolveInfo,
  ) {
    const { id: authorId } = author;
    const { booksLoader } = this.loaderService.getLoaders(info);
    return await booksLoader.load(authorId);
  }

  @Query(() => [AuthorModel])
  getAuthors(
    @Args('minNumberOfBooks', { type: () => Int, nullable: true })
    minNumberOfBooks: number,
    @Args('maxNumberOfBooks', { type: () => Int, nullable: true })
    maxNumberOfBooks: number,
    @Info()
    info: GraphQLResolveInfo,
  ) {
    return this.authorService.getAuthors(info, {
      minNumberOfBooks,
      maxNumberOfBooks,
    });
  }

  @Mutation(() => AuthorModel)
  createAuthor(
    @Args('author') authorInput: AuthorInput,
    @Info()
    info: GraphQLResolveInfo,
  ) {
    return this.authorService.createAuthor(authorInput, info);
  }

  @Mutation(() => Int)
  deleteAuthor(@Args('id', { type: () => Int }) id: number) {
    return this.authorService.deleteAuthor(id);
  }

  @Mutation(() => Int)
  deleteAuthorWithBooks(@Args('id', { type: () => Int }) id: number) {
    return this.authorService.deleteAuthorWithBooks(id);
  }
}
