import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
@ObjectType()
export class Room extends BaseEntity {
  @Field(() => String)
  @PrimaryColumn("text", { unique: true })
  id!: string;

  @Field()
  @Column("int", { default: 2 })
  users!: number;

  @Field()
  @Column("boolean", { default: false })
  inGame: boolean;

  @Field()
  @Column("text")
  adminSocketId!: string;
}
