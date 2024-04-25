import { ObjectType, Field, ID } from '@nestjs/graphql';
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
