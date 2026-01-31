import {
  ROOM_DOES_NOT_EXIST,
  USERNAME_EXIST_IN_ROOM,
  NONE,
  ROOM_IS_FULL,
  GAME_IN_PROGRESS,
} from "../constants";
import { Lobby } from "../entity/Lobby";
import { Room } from "../entity/Room";
import {
  Arg,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";

@ObjectType()
class FieldResponse {
  @Field()
  values: boolean;

  @Field({ nullable: true })
  code: string;
}

@ObjectType()
class UserResponse {
  @Field()
  values: boolean;

  @Field({ nullable: true })
  error: string;
}

@ObjectType()
class RoomUserResponse {
  @Field(() => UserResponse, { nullable: true })
  response?: UserResponse;
}

@ObjectType()
class RoomResponse {
  @Field(() => FieldResponse, { nullable: true })
  response?: FieldResponse;
}

@Resolver(Room)
export class RoomResolver {
  @Mutation(() => RoomResponse)
  async createRoom(
    @Arg("adminId") adminId: string,
    @Arg("username") username: string
  ): Promise<RoomResponse> {
    let hashString =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@$&";

    let len = hashString.length;
    let ans: string = "";
    while (1) {
      const length = Math.floor(Math.random() * 4) + 5;
      for (let i = 0; i < length; i++) {
        let index = Math.floor(Math.random() * len);
        ans += hashString[index];
      }

      const room = (await Room.findOne({ where: { id: ans } })) as Room;

      if (!room) {
        break;
      }
      ans = "";
    }

    let newRoom = await Room.create({
      id: ans,
      users: 1,
      adminSocketId: adminId,
    }).save();

    await Lobby.create({
      roomId: newRoom.id,
      userId: adminId,
      username: username,
    }).save();

    return {
      response: {
        values: true,
        code: ans.toString(),
      },
    };
  }

  @Mutation(() => RoomUserResponse)
  async joinRoom(
    @Arg("userId") userId: string,
    @Arg("username") username: string,
    @Arg("roomCode") roomCode: string
  ): Promise<RoomUserResponse> {
    let room = (await Room.findOne({ where: { id: roomCode } })) as Room;

    if (!room) {
      return {
        response: {
          values: false,
          error: ROOM_DOES_NOT_EXIST,
        },
      };
    }

    if (room.users === 0) {
      return {
        response: {
          values: false,
          error: ROOM_IS_FULL,
        },
      };
    }

    if (room.inGame) {
      return {
        response: {
          values: false,
          error: GAME_IN_PROGRESS,
        },
      };
    }

    let lobby = (await Lobby.find({ where: { roomId: roomCode } })) as Lobby[];

    for (let i = 0; i < lobby.length; i++) {
      if (lobby[i].username === username) {
        return {
          response: {
            values: false,
            error: USERNAME_EXIST_IN_ROOM,
          },
        };
      }
    }

    await Lobby.create({
      roomId: roomCode,
      userId: userId,
      username: username,
    }).save();
    await Room.update({ id: roomCode }, { users: room.users - 1 });
    return {
      response: {
        values: true,
        error: NONE,
      },
    };
  }

  @Mutation(() => Boolean)
  async leaveRoom(
    @Arg("id") id: string,
    @Arg("roomCode") roomCode: string
  ): Promise<Boolean> {
    let room = (await Room.findOne({ where: { id: roomCode } })) as Room;

    if (!room) return false;

    if (room.adminSocketId === id) {
      await Room.delete({ id: roomCode });
      await Lobby.delete({ roomId: roomCode });

      return true;
    }

    await Lobby.delete({ userId: id });

    return true;
  }

  @Query(() => Boolean)
  async getRoomStatus(@Arg("roomCode") roomCode: string): Promise<Boolean> {
    let room = (await Room.findOne({ where: { id: roomCode } })) as Room;

    if (room.inGame) return false;

    return true;
  }

  @Mutation(() => Boolean)
  async destroyRoomAndLobby(
    @Arg("roomCode") roomCode: string
  ): Promise<Boolean> {
    await Room.delete({ id: roomCode });
    await Lobby.delete({ roomId: roomCode });
    return true;
  }

  @Query(() => Room, { nullable: true })
  async getRoomDetails(
    @Arg("roomCode") roomCode: string
  ): Promise<Room | null> {
    const room = (await Room.findOne({ where: { id: roomCode } })) as Room;

    if (!room) {
      return null;
    }

    return room;
  }

  @Query(() => Int)
  async getNumberofUsersInRoom(
    @Arg("roomCode") roomCode: string
  ): Promise<number> {
    const room = (await Room.findOne({ where: { id: roomCode } })) as Room;

    return 5 - room.users;
  }

  @Query(() => [Lobby])
  async getLobbyDetails(@Arg("roomCode") roomCode: string): Promise<Lobby[]> {
    const lobby = (await Lobby.find({
      where: { roomId: roomCode },
    })) as Lobby[];
    return lobby;
  }
}
