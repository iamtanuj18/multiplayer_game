import {
  ROOM_DOES_NOT_EXIST,
  USERNAME_EXIST_IN_ROOM,
  NONE,
  ROOM_IS_FULL,
  GAME_IN_PROGRESS,
} from "../constants";
import { Lobby } from "../entity/Lobby";
import { Room } from "../entity/Room";
import { ILike } from "typeorm";
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
      users: 1, // Start with 1 user (the host)
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
    const normalizedUsername = username.trim();
    let room = (await Room.findOne({ where: { id: roomCode } })) as Room;

    if (!room) {
      return {
        response: {
          values: false,
          error: ROOM_DOES_NOT_EXIST,
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

    // Handle existing userId entry (reconnect or stale)
    const existingByUserId = await Lobby.findOne({
      where: { roomId: roomCode, userId: userId },
    });

    if (existingByUserId) {
      if (existingByUserId.username === normalizedUsername) {
        const currentCount = await Lobby.count({ where: { roomId: roomCode } });
        await Room.update({ id: roomCode }, { users: currentCount });
        return {
          response: {
            values: true,
            error: NONE,
          },
        };
      }

      // Remove stale entry for same userId
      await Lobby.delete({ id: existingByUserId.id });
    }

    // Handle existing username entry (prevent duplicates)
    const existingByUsername = await Lobby.findOne({
      where: { roomId: roomCode, username: ILike(normalizedUsername) },
    });

    if (existingByUsername) {
      if (existingByUsername.userId === userId) {
        const currentCount = await Lobby.count({ where: { roomId: roomCode } });
        await Room.update({ id: roomCode }, { users: currentCount });
        return {
          response: {
            values: true,
            error: NONE,
          },
        };
      }

      return {
        response: {
          values: false,
          error: USERNAME_EXIST_IN_ROOM,
        },
      };
    }

    const currentCount = await Lobby.count({ where: { roomId: roomCode } });

    // Check if room is full (max 2 players) using lobby count
    if (currentCount >= 2) {
      return {
        response: {
          values: false,
          error: ROOM_IS_FULL,
        },
      };
    }

    await Lobby.create({
      roomId: roomCode,
      userId: userId,
      username: normalizedUsername,
    }).save();

    // Keep user count consistent with lobby
    await Room.update({ id: roomCode }, { users: currentCount + 1 });
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

    // If admin/host leaves, delete everything
    if (room.adminSocketId === id) {
      await Room.delete({ id: roomCode });
      await Lobby.delete({ roomId: roomCode });

      return true;
    }

    // Regular player leaves - remove from lobby and decrement count
    await Lobby.delete({ roomId: roomCode, userId: id });

    // Keep user count consistent with lobby
    const remainingUsers = await Lobby.count({ where: { roomId: roomCode } });
    await Room.update({ id: roomCode }, { users: remainingUsers });

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

    // Return actual number of users in the room
    return room.users;
  }

  @Query(() => [Lobby])
  async getLobbyDetails(@Arg("roomCode") roomCode: string): Promise<Lobby[]> {
    const lobby = (await Lobby.find({
      where: { roomId: roomCode },
    })) as Lobby[];
    return lobby;
  }
}
