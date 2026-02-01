import { useEffect, useState } from "react";

import "./Board.css";
import "./PieceNotification.css";
import "./PlayerLabels.css";
import Tile from "../Tile";
import { FilesLetters, INITIAL_POSITIONS } from "../../constants";
import { TileInformation } from "../../models";
import { getValidMoves, isCheckmate, isStalemate } from "../../utils";
import { useWindowSize } from "../../hooks/useWindowSize";
import { isCheck } from "../../utils/isCheck";
import { socket } from "../../services/socket.js";

interface BoardProps {
  roomId: string;
  playerVal: string;
  currentTurn: string;
  isCheck: boolean;
  setCheck: (isCheck: boolean) => void;
  isBlackTurn: boolean;
  setTurn: (turn: boolean) => void;
  setCurrentTurn: (turn: string) => void;
  username: string;
  otherUsername: string;
  gameStarted: boolean;
  onGameOver: (winner: string | null, reason: "checkmate" | "stalemate") => void;
}

const Board = (props: BoardProps) => {
  const size = useWindowSize();
  const maximumSideSize = Math.min(size.width ?? 0, size.height ?? 0) * 0.8;
  let roomId = props.roomId;
  let playerVal = props.playerVal;

  const [pieceElementSelected, setPieceElementSelected] =
    useState<JSX.Element | null>(null);
  const [pieceSelectedPosition, setPieceSelectedPosition] = useState("");
  const [picesPositions, setPiecesPositions] =
    useState<TileInformation[]>(INITIAL_POSITIONS);
  const [lastMovePosition, setLastMovePosition] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const { setCheck, isBlackTurn } = props;
  let isBlackTile = true;
  const tiles = [];

  const handleClick = (position: string, piece: JSX.Element | null) => {
    // Block all moves until game has started
    if (!props.gameStarted) return;
    
    if (props.currentTurn !== props.playerVal) return;

    // Determine which color this player controls
    // Player 1 (host) controls white pieces (isBlack = false)
    // Player 2 (guest) controls black pieces (isBlack = true)
    const playerControlsBlack = props.playerVal === "2";

    if (pieceElementSelected) {
      // If clicking on the same piece, keep it selected (do nothing)
      if (pieceSelectedPosition === position) {
        return;
      }

      // If clicking on another piece, check if it's the same color to switch selection
      const clickedTile = picesPositions.find(p => p.position === position);
      const selectedTile = picesPositions.find(p => p.position === pieceSelectedPosition);
      
      if (clickedTile && selectedTile && clickedTile.piece) {
        // Both pieces are same color AND belong to this player - switch selection
        if (clickedTile.pieceController.isBlack === selectedTile.pieceController.isBlack &&
            clickedTile.pieceController.isBlack === playerControlsBlack) {
          const newPiecesPosition = picesPositions.map((p) => {
            if (p.position === position) {
              p.pieceController.selected = true;
            } else {
              p.pieceController.selected = false;
            }
            return p;
          });
          setPiecesPositions(newPiecesPosition);
          setPieceElementSelected(clickedTile.piece);
          setPieceSelectedPosition(position);
          return;
        }
      }

      // Otherwise, attempt to move
      const pieceSelected = picesPositions.find(
        (piece) => piece.position === pieceSelectedPosition
      );
      if (pieceSelected) {
        pieceSelected.pieceController.selected = false;
        const newPiecesPosition = picesPositions.filter(
          (piece) =>
            piece.position !== pieceSelectedPosition &&
            piece.position !== position
        );
        newPiecesPosition.push({
          position: position,
          piece: pieceElementSelected,
          pieceController: pieceSelected.pieceController,
        });
        setPiecesPositions(newPiecesPosition);
        if (pieceSelectedPosition !== position) {
          socket.emit("move", {
            newPos: position,
            oldPos: pieceSelectedPosition,
            roomId: roomId,
            player: playerVal,
            nextTurn: playerVal === "1" ? "2" : "1",
          });
          if (props.currentTurn === "1") {
            props.setCurrentTurn("2");
          } else if (props.currentTurn === "2") {
            props.setCurrentTurn("1");
          }
          props.setTurn(!props.isBlackTurn);
          setLastMovePosition(position);
        }
      }
      setPieceElementSelected(null);
      setPieceSelectedPosition("");
    } else {
      if (piece) {
        // Check if the clicked piece belongs to the current player
        const clickedPiece = picesPositions.find(p => p.position === position);
        if (!clickedPiece) return;
        
        // Only allow selecting pieces of the player's color
        if (clickedPiece.pieceController.isBlack !== playerControlsBlack) {
          // Show notification for opponent's piece
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 2000);
          return; // Cannot select opponent's pieces
        }

        setPieceElementSelected(piece);
        setPieceSelectedPosition(position);
        const newPiecesPosition = picesPositions.map((piece) => {
          if (piece.position === position) {
            piece.pieceController.selected = true;
          }
          return piece;
        });

        setPiecesPositions(newPiecesPosition);
      }
    }
  };

  useEffect(() => {
    socket.on("userMove", (data) => {
      const newPiecesPosition = picesPositions.filter(
        (piece) =>
          piece.position !== data.oldPos && piece.position !== data.newPos
      );
      const oldPiece = picesPositions.find(
        (piece) => piece.position === data.oldPos
      );

      newPiecesPosition.push({
        position: data.newPos,
        piece: oldPiece!.piece,
        pieceController: oldPiece!.pieceController,
      });

      setPiecesPositions(newPiecesPosition);
      props.setCurrentTurn(data.nextTurn);

      if (data.nextTurn === "1") {
        props.setCurrentTurn("1");
      } else if (data.nextTurn === "2") {
        props.setCurrentTurn("2");
      }

      props.setTurn(!props.isBlackTurn);
    });

    return () => {
      socket.off("userMove");
    };
  });

  useEffect(() => {
    const inCheck = isCheck(picesPositions, isBlackTurn, lastMovePosition);
    setCheck(inCheck);

    // Check for checkmate
    if (inCheck && isCheckmate(picesPositions, isBlackTurn, lastMovePosition)) {
      // The current player (whose turn it is) is in checkmate, so they lose
      const winner = isBlackTurn ? props.otherUsername : props.username;
      props.onGameOver(winner, "checkmate");
      return;
    }

    // Check for stalemate
    if (!inCheck && isStalemate(picesPositions, isBlackTurn, lastMovePosition)) {
      props.onGameOver(null, "stalemate");
      return;
    }
  });

  const validMoves = getValidMoves(
    picesPositions,
    picesPositions.find((piece) => piece.position === pieceSelectedPosition),
    props.isBlackTurn
  );

  let pos: keyof typeof picesPositions;
  for (let rank = 8; rank > 0; rank--) {
    isBlackTile = !isBlackTile;
    for (let file = 0; file < 8; file++) {
      pos = (FilesLetters[file] + rank) as keyof typeof picesPositions;
      const currentPos = pos; // Capture pos value for closure
      // eslint-disable-next-line
      const currentTile = picesPositions.find((tile) => tile.position === currentPos);
      const selected = currentTile?.pieceController.selected;
      const piece = currentTile?.piece;

      tiles.push(
        <Tile
          key={String(currentPos)}
          isBlackTile={isBlackTile}
          position={String(currentPos)}
          isSelected={selected || false}
          isValid={validMoves?.some((tile: string) => tile === currentPos) || false}
          pieceSelected={pieceElementSelected !== null}
          handleClick={handleClick}
        >
          {piece}
        </Tile>
      );
      isBlackTile = !isBlackTile;
    }
  }

  // Player 1 sees opponent at top, themselves at bottom
  // Player 2 sees opponent at bottom, themselves at top
  const topPlayerName = props.playerVal === "1" ? props.otherUsername : props.username;
  const bottomPlayerName = props.playerVal === "1" ? props.username : props.otherUsername;
  const topIsYourSide = props.playerVal === "2";
  const bottomIsYourSide = props.playerVal === "1";

  return (
    <>
      {showNotification && (
        <div className="piece-notification">
          ⚠️ Not your piece!
        </div>
      )}
      
      <div className={`player-label top ${topIsYourSide ? 'your-side' : 'opponent-side'}`}>
        <span className="player-name">{topPlayerName}</span>
        <span className="player-role">{topIsYourSide ? '(Your Side)' : '(Opponent)'}</span>
      </div>

      <div
        className="board"
        style={{ width: maximumSideSize, height: maximumSideSize }}
      >
        {tiles}
      </div>

      <div className={`player-label bottom ${bottomIsYourSide ? 'your-side' : 'opponent-side'}`}>
        <span className="player-name">{bottomPlayerName}</span>
        <span className="player-role">{bottomIsYourSide ? '(Your Side)' : '(Opponent)'}</span>
      </div>
    </>
  );
};

export default Board;
