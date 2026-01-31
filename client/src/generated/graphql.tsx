import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
import { IntrospectionQuery } from "graphql";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
const defaultOptions = {};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type FieldResponse = {
  __typename?: "FieldResponse";
  code?: Maybe<Scalars["String"]>;
  values: Scalars["Boolean"];
};

export type Lobby = {
  __typename?: "Lobby";
  id: Scalars["ID"];
  roomId: Scalars["String"];
  userId: Scalars["String"];
  username: Scalars["String"];
};

export type Mutation = {
  __typename?: "Mutation";
  createRoom: RoomResponse;
  createUser: Scalars["Boolean"];
  destroyRoomAndLobby: Scalars["Boolean"];
  joinRoom: RoomUserResponse;
  leaveRoom: Scalars["Boolean"];
};

export type MutationCreateRoomArgs = {
  adminId: Scalars["String"];
  username: Scalars["String"];
};

export type MutationCreateUserArgs = {
  id: Scalars["String"];
  username: Scalars["String"];
};

export type MutationDestroyRoomAndLobbyArgs = {
  roomCode: Scalars["String"];
};

export type MutationJoinRoomArgs = {
  roomCode: Scalars["String"];
  userId: Scalars["String"];
  username: Scalars["String"];
};

export type MutationLeaveRoomArgs = {
  id: Scalars["String"];
  roomCode: Scalars["String"];
};

export type Query = {
  __typename?: "Query";
  getLobbyDetails: Array<Lobby>;
  getNumberofUsersInRoom: Scalars["Int"];
  getRoomDetails?: Maybe<Room>;
  getRoomStatus: Scalars["Boolean"];
  hello: Scalars["String"];
};

export type QueryGetLobbyDetailsArgs = {
  roomCode: Scalars["String"];
};

export type QueryGetNumberofUsersInRoomArgs = {
  roomCode: Scalars["String"];
};

export type QueryGetRoomDetailsArgs = {
  roomCode: Scalars["String"];
};

export type QueryGetRoomStatusArgs = {
  roomCode: Scalars["String"];
};

export type Room = {
  __typename?: "Room";
  adminSocketId: Scalars["String"];
  id: Scalars["String"];
  inGame: Scalars["Boolean"];
  users: Scalars["Float"];
};

export type RoomResponse = {
  __typename?: "RoomResponse";
  response?: Maybe<FieldResponse>;
};

export type RoomUserResponse = {
  __typename?: "RoomUserResponse";
  response?: Maybe<UserResponse>;
};

export type UserResponse = {
  __typename?: "UserResponse";
  error?: Maybe<Scalars["String"]>;
  values: Scalars["Boolean"];
};

export type RegularRoomResponseFragment = {
  __typename?: "RoomResponse";
  response?:
    | {
        __typename?: "FieldResponse";
        values: boolean;
        code?: string | null | undefined;
      }
    | null
    | undefined;
};

export type RegularFieldResponseFragment = {
  __typename?: "FieldResponse";
  values: boolean;
  code?: string | null | undefined;
};

export type RegularLobbyFragment = {
  __typename?: "Lobby";
  id: string;
  roomId: string;
  userId: string;
  username: string;
};

export type RegularRoomFragment = {
  __typename?: "Room";
  id: string;
  users: number;
  inGame: boolean;
  adminSocketId: string;
};

export type RegularUserResponseFragment = {
  __typename?: "UserResponse";
  values: boolean;
  error?: string | null | undefined;
};

export type RegularUserRoomResponseFragment = {
  __typename?: "RoomUserResponse";
  response?:
    | {
        __typename?: "UserResponse";
        values: boolean;
        error?: string | null | undefined;
      }
    | null
    | undefined;
};

export type CreateRoomMutationVariables = Exact<{
  adminId: Scalars["String"];
  username: Scalars["String"];
}>;

export type CreateRoomMutation = {
  __typename?: "Mutation";
  createRoom: {
    __typename?: "RoomResponse";
    response?:
      | {
          __typename?: "FieldResponse";
          values: boolean;
          code?: string | null | undefined;
        }
      | null
      | undefined;
  };
};

export type JoinRoomMutationVariables = Exact<{
  userId: Scalars["String"];
  username: Scalars["String"];
  roomCode: Scalars["String"];
}>;

export type JoinRoomMutation = {
  __typename?: "Mutation";
  joinRoom: {
    __typename?: "RoomUserResponse";
    response?:
      | {
          __typename?: "UserResponse";
          values: boolean;
          error?: string | null | undefined;
        }
      | null
      | undefined;
  };
};

export type DestroyRoomAndLobbyMutationVariables = Exact<{
  roomCode: Scalars["String"];
}>;

export type DestroyRoomAndLobbyMutation = {
  __typename?: "Mutation";
  destroyRoomAndLobby: boolean;
};

export type LeaveRoomMutationVariables = Exact<{
  id: Scalars["String"];
  roomCode: Scalars["String"];
}>;

export type LeaveRoomMutation = { __typename?: "Mutation"; leaveRoom: boolean };

export type NumberOfUsersInRoomQueryVariables = Exact<{
  roomCode: Scalars["String"];
}>;

export type NumberOfUsersInRoomQuery = {
  __typename?: "Query";
  getNumberofUsersInRoom: number;
};

export type GetLobbyDetailsQueryVariables = Exact<{
  roomCode: Scalars["String"];
}>;

export type GetLobbyDetailsQuery = {
  __typename?: "Query";
  getLobbyDetails: Array<{
    __typename?: "Lobby";
    id: string;
    roomId: string;
    userId: string;
    username: string;
  }>;
};

export type RoomDetailsQueryVariables = Exact<{
  roomCode: Scalars["String"];
}>;

export type RoomDetailsQuery = {
  __typename?: "Query";
  getRoomDetails?:
    | {
        __typename?: "Room";
        id: string;
        users: number;
        inGame: boolean;
        adminSocketId: string;
      }
    | null
    | undefined;
};

export const RegularFieldResponseFragmentDoc = gql`
  fragment RegularFieldResponse on FieldResponse {
    values
    code
  }
`;
export const RegularRoomResponseFragmentDoc = gql`
  fragment RegularRoomResponse on RoomResponse {
    response {
      ...RegularFieldResponse
    }
  }
  ${RegularFieldResponseFragmentDoc}
`;
export const RegularLobbyFragmentDoc = gql`
  fragment RegularLobby on Lobby {
    id
    roomId
    userId
    username
  }
`;
export const RegularRoomFragmentDoc = gql`
  fragment RegularRoom on Room {
    id
    users
    inGame
    adminSocketId
  }
`;
export const RegularUserResponseFragmentDoc = gql`
  fragment RegularUserResponse on UserResponse {
    values
    error
  }
`;
export const RegularUserRoomResponseFragmentDoc = gql`
  fragment RegularUserRoomResponse on RoomUserResponse {
    response {
      ...RegularUserResponse
    }
  }
  ${RegularUserResponseFragmentDoc}
`;
export const CreateRoomDocument = gql`
  mutation CreateRoom($adminId: String!, $username: String!) {
    createRoom(adminId: $adminId, username: $username) {
      ...RegularRoomResponse
    }
  }
  ${RegularRoomResponseFragmentDoc}
`;
export type CreateRoomMutationFn = Apollo.MutationFunction<
  CreateRoomMutation,
  CreateRoomMutationVariables
>;

/**
 * __useCreateRoomMutation__
 *
 * To run a mutation, you first call `useCreateRoomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRoomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRoomMutation, { data, loading, error }] = useCreateRoomMutation({
 *   variables: {
 *      adminId: // value for 'adminId'
 *      username: // value for 'username'
 *   },
 * });
 */
export function useCreateRoomMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateRoomMutation,
    CreateRoomMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateRoomMutation, CreateRoomMutationVariables>(
    CreateRoomDocument,
    options
  );
}
export type CreateRoomMutationHookResult = ReturnType<
  typeof useCreateRoomMutation
>;
export type CreateRoomMutationResult =
  Apollo.MutationResult<CreateRoomMutation>;
export type CreateRoomMutationOptions = Apollo.BaseMutationOptions<
  CreateRoomMutation,
  CreateRoomMutationVariables
>;
export const JoinRoomDocument = gql`
  mutation JoinRoom($userId: String!, $username: String!, $roomCode: String!) {
    joinRoom(userId: $userId, username: $username, roomCode: $roomCode) {
      ...RegularUserRoomResponse
    }
  }
  ${RegularUserRoomResponseFragmentDoc}
`;
export type JoinRoomMutationFn = Apollo.MutationFunction<
  JoinRoomMutation,
  JoinRoomMutationVariables
>;

/**
 * __useJoinRoomMutation__
 *
 * To run a mutation, you first call `useJoinRoomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinRoomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinRoomMutation, { data, loading, error }] = useJoinRoomMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      username: // value for 'username'
 *      roomCode: // value for 'roomCode'
 *   },
 * });
 */
export function useJoinRoomMutation(
  baseOptions?: Apollo.MutationHookOptions<
    JoinRoomMutation,
    JoinRoomMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<JoinRoomMutation, JoinRoomMutationVariables>(
    JoinRoomDocument,
    options
  );
}
export type JoinRoomMutationHookResult = ReturnType<typeof useJoinRoomMutation>;
export type JoinRoomMutationResult = Apollo.MutationResult<JoinRoomMutation>;
export type JoinRoomMutationOptions = Apollo.BaseMutationOptions<
  JoinRoomMutation,
  JoinRoomMutationVariables
>;
export const DestroyRoomAndLobbyDocument = gql`
  mutation DestroyRoomAndLobby($roomCode: String!) {
    destroyRoomAndLobby(roomCode: $roomCode)
  }
`;
export type DestroyRoomAndLobbyMutationFn = Apollo.MutationFunction<
  DestroyRoomAndLobbyMutation,
  DestroyRoomAndLobbyMutationVariables
>;

/**
 * __useDestroyRoomAndLobbyMutation__
 *
 * To run a mutation, you first call `useDestroyRoomAndLobbyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDestroyRoomAndLobbyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [destroyRoomAndLobbyMutation, { data, loading, error }] = useDestroyRoomAndLobbyMutation({
 *   variables: {
 *      roomCode: // value for 'roomCode'
 *   },
 * });
 */
export function useDestroyRoomAndLobbyMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DestroyRoomAndLobbyMutation,
    DestroyRoomAndLobbyMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DestroyRoomAndLobbyMutation,
    DestroyRoomAndLobbyMutationVariables
  >(DestroyRoomAndLobbyDocument, options);
}
export type DestroyRoomAndLobbyMutationHookResult = ReturnType<
  typeof useDestroyRoomAndLobbyMutation
>;
export type DestroyRoomAndLobbyMutationResult =
  Apollo.MutationResult<DestroyRoomAndLobbyMutation>;
export type DestroyRoomAndLobbyMutationOptions = Apollo.BaseMutationOptions<
  DestroyRoomAndLobbyMutation,
  DestroyRoomAndLobbyMutationVariables
>;
export const LeaveRoomDocument = gql`
  mutation LeaveRoom($id: String!, $roomCode: String!) {
    leaveRoom(id: $id, roomCode: $roomCode)
  }
`;
export type LeaveRoomMutationFn = Apollo.MutationFunction<
  LeaveRoomMutation,
  LeaveRoomMutationVariables
>;

/**
 * __useLeaveRoomMutation__
 *
 * To run a mutation, you first call `useLeaveRoomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLeaveRoomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [leaveRoomMutation, { data, loading, error }] = useLeaveRoomMutation({
 *   variables: {
 *      id: // value for 'id'
 *      roomCode: // value for 'roomCode'
 *   },
 * });
 */
export function useLeaveRoomMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LeaveRoomMutation,
    LeaveRoomMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LeaveRoomMutation, LeaveRoomMutationVariables>(
    LeaveRoomDocument,
    options
  );
}
export type LeaveRoomMutationHookResult = ReturnType<
  typeof useLeaveRoomMutation
>;
export type LeaveRoomMutationResult = Apollo.MutationResult<LeaveRoomMutation>;
export type LeaveRoomMutationOptions = Apollo.BaseMutationOptions<
  LeaveRoomMutation,
  LeaveRoomMutationVariables
>;
export const NumberOfUsersInRoomDocument = gql`
  query NumberOfUsersInRoom($roomCode: String!) {
    getNumberofUsersInRoom(roomCode: $roomCode)
  }
`;

/**
 * __useNumberOfUsersInRoomQuery__
 *
 * To run a query within a React component, call `useNumberOfUsersInRoomQuery` and pass it any options that fit your needs.
 * When your component renders, `useNumberOfUsersInRoomQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNumberOfUsersInRoomQuery({
 *   variables: {
 *      roomCode: // value for 'roomCode'
 *   },
 * });
 */
export function useNumberOfUsersInRoomQuery(
  baseOptions: Apollo.QueryHookOptions<
    NumberOfUsersInRoomQuery,
    NumberOfUsersInRoomQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    NumberOfUsersInRoomQuery,
    NumberOfUsersInRoomQueryVariables
  >(NumberOfUsersInRoomDocument, options);
}
export function useNumberOfUsersInRoomLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NumberOfUsersInRoomQuery,
    NumberOfUsersInRoomQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    NumberOfUsersInRoomQuery,
    NumberOfUsersInRoomQueryVariables
  >(NumberOfUsersInRoomDocument, options);
}
export type NumberOfUsersInRoomQueryHookResult = ReturnType<
  typeof useNumberOfUsersInRoomQuery
>;
export type NumberOfUsersInRoomLazyQueryHookResult = ReturnType<
  typeof useNumberOfUsersInRoomLazyQuery
>;
export type NumberOfUsersInRoomQueryResult = Apollo.QueryResult<
  NumberOfUsersInRoomQuery,
  NumberOfUsersInRoomQueryVariables
>;
export const GetLobbyDetailsDocument = gql`
  query GetLobbyDetails($roomCode: String!) {
    getLobbyDetails(roomCode: $roomCode) {
      ...RegularLobby
    }
  }
  ${RegularLobbyFragmentDoc}
`;

/**
 * __useGetLobbyDetailsQuery__
 *
 * To run a query within a React component, call `useGetLobbyDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLobbyDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLobbyDetailsQuery({
 *   variables: {
 *      roomCode: // value for 'roomCode'
 *   },
 * });
 */
export function useGetLobbyDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetLobbyDetailsQuery,
    GetLobbyDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetLobbyDetailsQuery, GetLobbyDetailsQueryVariables>(
    GetLobbyDetailsDocument,
    options
  );
}
export function useGetLobbyDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLobbyDetailsQuery,
    GetLobbyDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetLobbyDetailsQuery,
    GetLobbyDetailsQueryVariables
  >(GetLobbyDetailsDocument, options);
}
export type GetLobbyDetailsQueryHookResult = ReturnType<
  typeof useGetLobbyDetailsQuery
>;
export type GetLobbyDetailsLazyQueryHookResult = ReturnType<
  typeof useGetLobbyDetailsLazyQuery
>;
export type GetLobbyDetailsQueryResult = Apollo.QueryResult<
  GetLobbyDetailsQuery,
  GetLobbyDetailsQueryVariables
>;
export const RoomDetailsDocument = gql`
  query RoomDetails($roomCode: String!) {
    getRoomDetails(roomCode: $roomCode) {
      ...RegularRoom
    }
  }
  ${RegularRoomFragmentDoc}
`;

/**
 * __useRoomDetailsQuery__
 *
 * To run a query within a React component, call `useRoomDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRoomDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRoomDetailsQuery({
 *   variables: {
 *      roomCode: // value for 'roomCode'
 *   },
 * });
 */
export function useRoomDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    RoomDetailsQuery,
    RoomDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<RoomDetailsQuery, RoomDetailsQueryVariables>(
    RoomDetailsDocument,
    options
  );
}
export function useRoomDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    RoomDetailsQuery,
    RoomDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<RoomDetailsQuery, RoomDetailsQueryVariables>(
    RoomDetailsDocument,
    options
  );
}
export type RoomDetailsQueryHookResult = ReturnType<typeof useRoomDetailsQuery>;
export type RoomDetailsLazyQueryHookResult = ReturnType<
  typeof useRoomDetailsLazyQuery
>;
export type RoomDetailsQueryResult = Apollo.QueryResult<
  RoomDetailsQuery,
  RoomDetailsQueryVariables
>;

export default {
  __schema: {
    queryType: {
      name: "Query",
    },
    mutationType: {
      name: "Mutation",
    },
    subscriptionType: null,
    types: [
      {
        kind: "OBJECT",
        name: "FieldResponse",
        fields: [
          {
            name: "code",
            type: {
              kind: "SCALAR",
              name: "Any",
            },
            args: [],
          },
          {
            name: "values",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [],
          },
        ],
        interfaces: [],
      },
      {
        kind: "OBJECT",
        name: "Lobby",
        fields: [
          {
            name: "id",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [],
          },
          {
            name: "roomId",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [],
          },
          {
            name: "userId",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [],
          },
          {
            name: "username",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [],
          },
        ],
        interfaces: [],
      },
      {
        kind: "OBJECT",
        name: "Mutation",
        fields: [
          {
            name: "createRoom",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "OBJECT",
                name: "RoomResponse",
                ofType: null,
              },
            },
            args: [
              {
                name: "adminId",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
              {
                name: "username",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
            ],
          },
          {
            name: "createUser",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [
              {
                name: "id",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
              {
                name: "username",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
            ],
          },
          {
            name: "destroyRoomAndLobby",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [
              {
                name: "roomCode",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
            ],
          },
          {
            name: "joinRoom",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "OBJECT",
                name: "RoomUserResponse",
                ofType: null,
              },
            },
            args: [
              {
                name: "roomCode",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
              {
                name: "userId",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
              {
                name: "username",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
            ],
          },
          {
            name: "leaveRoom",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [
              {
                name: "id",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
              {
                name: "roomCode",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
            ],
          },
        ],
        interfaces: [],
      },
      {
        kind: "OBJECT",
        name: "Query",
        fields: [
          {
            name: "getLobbyDetails",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "LIST",
                ofType: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "OBJECT",
                    name: "Lobby",
                    ofType: null,
                  },
                },
              },
            },
            args: [
              {
                name: "roomCode",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
            ],
          },
          {
            name: "getNumberofUsersInRoom",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [
              {
                name: "roomCode",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
            ],
          },
          {
            name: "getRoomDetails",
            type: {
              kind: "OBJECT",
              name: "Room",
              ofType: null,
            },
            args: [
              {
                name: "roomCode",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
            ],
          },
          {
            name: "getRoomStatus",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [
              {
                name: "roomCode",
                type: {
                  kind: "NON_NULL",
                  ofType: {
                    kind: "SCALAR",
                    name: "Any",
                  },
                },
              },
            ],
          },
          {
            name: "hello",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [],
          },
        ],
        interfaces: [],
      },
      {
        kind: "OBJECT",
        name: "Room",
        fields: [
          {
            name: "adminSocketId",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [],
          },
          {
            name: "id",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [],
          },
          {
            name: "inGame",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [],
          },
          {
            name: "users",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [],
          },
        ],
        interfaces: [],
      },
      {
        kind: "OBJECT",
        name: "RoomResponse",
        fields: [
          {
            name: "response",
            type: {
              kind: "OBJECT",
              name: "FieldResponse",
              ofType: null,
            },
            args: [],
          },
        ],
        interfaces: [],
      },
      {
        kind: "OBJECT",
        name: "RoomUserResponse",
        fields: [
          {
            name: "response",
            type: {
              kind: "OBJECT",
              name: "UserResponse",
              ofType: null,
            },
            args: [],
          },
        ],
        interfaces: [],
      },
      {
        kind: "OBJECT",
        name: "UserResponse",
        fields: [
          {
            name: "error",
            type: {
              kind: "SCALAR",
              name: "Any",
            },
            args: [],
          },
          {
            name: "values",
            type: {
              kind: "NON_NULL",
              ofType: {
                kind: "SCALAR",
                name: "Any",
              },
            },
            args: [],
          },
        ],
        interfaces: [],
      },
      {
        kind: "SCALAR",
        name: "Any",
      },
    ],
    directives: [],
  },
} as unknown as IntrospectionQuery;
