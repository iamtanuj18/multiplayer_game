import { Field, ID, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@ObjectType()
@Entity()
export class Lobby extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field()
  @Column("text")
  roomId: string;

  @Field()
  @Column("text")
  userId: string;

  @Field()
  @Column("text")
  username: string;
}
