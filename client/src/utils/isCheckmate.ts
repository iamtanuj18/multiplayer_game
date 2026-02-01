import { TileInformation } from "../models";
import { getValidMoves } from "./getValidMoves";
import { isCheck } from "./isCheck";
import { PositionUtils } from "./positionUtils";

/**
 * Determines if the current player is in checkmate
 * @param piecesPosition Current board state
 * @param isBlackTurn Whether it's black's turn
 * @param lastMovePosition Position of the last move made
 * @returns true if checkmate, false otherwise
 */
export function isCheckmate(
  piecesPosition: TileInformation[],
  isBlackTurn: boolean,
  lastMovePosition: string
): boolean {
  // First check if the king is even in check
  if (!isCheck(piecesPosition, isBlackTurn, lastMovePosition)) {
    return false;
  }

  // Get all pieces of the current player
  const currentPlayerPieces = piecesPosition.filter(
    (piece) => piece.pieceController.isBlack === isBlackTurn
  );

  // For each piece, check if any move can get out of check
  for (const piece of currentPlayerPieces) {
    const piecePosition = PositionUtils.splitString(piece.position);
    const validMoves = piece.pieceController.getValidMoves(
      piecePosition,
      piecesPosition,
      isBlackTurn
    );

    // Try each valid move to see if it gets the king out of check
    for (const move of validMoves) {
      // Skip the current position
      if (move === piece.position) continue;

      // Simulate the move
      const simulatedBoard = piecesPosition
        .filter((p) => p.position !== piece.position && p.position !== move)
        .concat({
          position: move,
          piece: piece.piece,
          pieceController: piece.pieceController,
        });

      // Check if this move gets us out of check
      if (!isCheck(simulatedBoard, isBlackTurn, move)) {
        return false; // Found a valid move, not checkmate
      }
    }
  }

  // No valid moves found that get out of check - it's checkmate
  return true;
}
