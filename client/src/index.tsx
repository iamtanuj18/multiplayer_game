import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import "./index.css";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://multiplayer-chess-online-game.herokuapp.com/graphql",
  credentials: "include",
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
