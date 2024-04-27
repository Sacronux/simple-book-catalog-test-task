import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { AuthorModel } from 'src/authors/authors.model';

@ObjectType()
export class BookModel {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field(() => [AuthorModel])
  authors: AuthorModel[];
}

@InputType()
export class BookInput {
  @Field()
  title: string;

  @Field(() => [ID])
  authorIds: number[];
}
