import { ObjectType, Field, ID } from '@nestjs/graphql';
import { BookModel } from 'src/books/books.model';

@ObjectType()
export class AuthorModel {
  @Field(() => ID)
  id: number;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => [BookModel])
  books: BookModel[];
}
