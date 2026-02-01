import { TileInformation } from "../models";
import { PositionUtils } from "./positionUtils";
import { isCheck } from "./isCheck";

/**
 * Determines if the current player is in stalemate (no legal moves but not in check)
 * @param piecesPosition Current board state
 * @param isBlackTurn Whether it's black's turn
 * @param lastMovePosition Position of the last move made
 * @returns true if stalemate, false otherwise
 */
export function isStalemate(
  piecesPosition: TileInformation[],
  isBlackTurn: boolean,
  lastMovePosition: string
): boolean {
  // If in check, it's not stalemate (could be checkmate)
  if (isCheck(piecesPosition, isBlackTurn, lastMovePosition)) {
    return false;
  }

  // Get all pieces of the current player
  const currentPlayerPieces = piecesPosition.filter(
    (piece) => piece.pieceController.isBlack === isBlackTurn
  );

  // Check if any piece has any legal move
  for (const piece of currentPlayerPieces) {
    const piecePosition = PositionUtils.splitString(piece.position);
    const validMoves = piece.pieceController.getValidMoves(
      piecePosition,
      piecesPosition,
      isBlackTurn
    );

    // Filter out the current position and check if any other move is legal
    for (const move of validMoves) {
      if (move === piece.position) continue;

      // Simulate the move
      const simulatedBoard = piecesPosition
        .filter((p) => p.position !== piece.position && p.position !== move)
        .concat({
          position: move,
          piece: piece.piece,
          pieceController: piece.pieceController,
        });

      // If this move doesn't put us in check, we have a legal move
      if (!isCheck(simulatedBoard, isBlackTurn, move)) {
        return false; // Found a legal move, not stalemate
      }
    }
  }

  // No legal moves found and not in check - it's stalemate
  return true;
}
