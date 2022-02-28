import React from "react";
import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ChessGameScreen } from "./pages/ChessGameScreen";
import { GameInfoScreen } from "./pages/GameInfoScreen";
import { HomeScreen } from "./pages/HomeScreen";
import { TestScreen } from "./pages/TestScreen";

function App() {
  return (
    <Router>
      <main className="py-3">
        <Container>
          <Route path="/" component={HomeScreen} exact />
          <Route path="/gameInfo/:roomId" component={GameInfoScreen} exact />
          <Route path="/game/:roomId" component={ChessGameScreen} exact />
          <Route path="/test" component={TestScreen} exact />
        </Container>
      </main>
    </Router>
  );
}

export default App;
