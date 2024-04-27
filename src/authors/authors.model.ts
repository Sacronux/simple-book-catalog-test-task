import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
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

@InputType()
export class AuthorInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;
}
