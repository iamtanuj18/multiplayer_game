import { useEffect, useState } from "react";

import "./Board.css";
import Tile from "../Tile";
import { FilesLetters, INITIAL_POSITIONS } from "../../constants";
import { TileInformation } from "../../models";
import { getValidMoves } from "../../utils";
import { useWindowSize } from "../../hooks/useWindowSize";
import { isCheck } from "../../utils/isCheck";
import { socket } from "../../services/socket.js";
import { setTokenSourceMapRange } from "typescript";

const Board = (props: any) => {
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
  const { setCheck, isBlackTurn } = props;
  let isBlackTile = true;
  const tiles = [];

  const handleClick = (position: string, piece: any) => {
    if (props.currentTurn !== props.playerVal) return;

    if (pieceElementSelected) {
      const pieceSelected = picesPositions.find(
        (piece) => piece.position === pieceSelectedPosition
      );
      //    console.log("Piece Selected");
      //  console.log(pieceSelected);
      if (pieceSelected) {
        pieceSelected.pieceController.selected = false;
        const newPiecesPosition = picesPositions.filter(
          (piece) =>
            piece.position !== pieceSelectedPosition &&
            piece.position !== position
        );
        // console.log("Pushing new Items");
        // console.log(position);
        newPiecesPosition.push({
          position: position,
          piece: pieceElementSelected,
          pieceController: pieceSelected.pieceController,
        });
        setPiecesPositions(newPiecesPosition);
        if (pieceSelectedPosition !== position) {
          // console.log("New Position");
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
      // console.log("User Move Data");
      // console.log(data);
      const newPiecesPosition = picesPositions.filter(
        (piece) =>
          piece.position !== data.oldPos && piece.position !== data.newPos
      );
      const oldPiece = picesPositions.find(
        (piece) => piece.position === data.oldPos
      );
      // console.log("Old Piece");
      // console.log(oldPiece);

      newPiecesPosition.push({
        position: data.newPos,
        piece: oldPiece!.piece,
        pieceController: oldPiece!.pieceController,
      });

      setPiecesPositions(newPiecesPosition);
      props.setCurrentTurn(data.nextTurn);

      // if (data.nextTurn === "2") {
      //   props.setTurn(true);
      // } else if (data.nextTurn === "1") {
      //   props.setTurn(false);
      // }

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
    setCheck(isCheck(picesPositions, isBlackTurn, lastMovePosition));

    // if(props.isCheck){

    // }
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
      // eslint-disable-next-line
      const currentTile = picesPositions.find((tile) => tile.position === pos);
      const selected = currentTile?.pieceController.selected;
      const piece = currentTile?.piece;

      tiles.push(
        <Tile
          key={pos}
          isBlackTile={isBlackTile}
          position={pos}
          isSelected={selected}
          // eslint-disable-next-line
          isValid={validMoves?.some((tile: any) => tile === pos)}
          pieceSelected={pieceElementSelected !== null}
          handleClick={handleClick}
        >
          {piece}
        </Tile>
      );
      isBlackTile = !isBlackTile;
    }
  }

  return (
    <div
      className="board"
      style={{ width: maximumSideSize, height: maximumSideSize }}
    >
      {tiles}
    </div>
  );
};

export default Board;
