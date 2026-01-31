import { Field } from "type-graphql";

import { Entity, Column, PrimaryColumn, BaseEntity } from "typeorm";

@Entity()
export class User extends BaseEntity {
  @Field(() => String)
  @PrimaryColumn("text")
  id!: string;

  @Field()
  @Column()
  username!: string;
}
