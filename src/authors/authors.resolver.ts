import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthorType, AuthorInput } from './dto/author.dto';
import { AuthorService } from './author.service';

@Resolver(() => AuthorType)
export class AuthorResolver {
  constructor(private authorService: AuthorService) {}

  @Query(() => AuthorType, { nullable: true })
  getAuthor(@Args('id', { type: () => Int }) id: number) {
    return this.authorService.getAuthorById(id);
  }

  @Mutation(() => AuthorType)
  createAuthor(@Args('author') authorInput: AuthorInput) {
    return this.authorService.createAuthor(authorInput);
  }
}