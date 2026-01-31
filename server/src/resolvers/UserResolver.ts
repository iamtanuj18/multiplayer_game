import { User } from "../entity/User";
import { Arg, Mutation, Resolver } from "type-graphql";

@Resolver(User)
export class UserResolver {
  @Mutation(() => Boolean)
  async createUser(
    @Arg("id") id: string,
    @Arg("username") username: string
  ): Promise<Boolean> {
    await User.create({
      id: id,
      username: username,
    }).save();

    return true;
  }
}
