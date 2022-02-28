import { HelloResolver } from "../resolvers/HelloResolver";
import { buildSchema } from "type-graphql";
import { RoomResolver } from "../resolvers/RoomResolver";
import { UserResolver } from "../resolvers/UserResolver";

export const createBuildSchema = () =>
  buildSchema({
    resolvers: [HelloResolver, RoomResolver, UserResolver],
  });
