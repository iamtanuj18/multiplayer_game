import { TileInformation } from "../models";
import { PIECE_TYPES } from "../constants";
import { PositionUtils } from ".";

/**
 * Simulates a move and checks if it would leave the king in check
 * @param piecesPosition Current board state
 * @param fromPosition Position to move from
 * @param toPosition Position to move to
 * @param isBlackPlayer Is this the black player's move
 * @returns true if the king would be in check after this move
 */
export function wouldBeInCheck(
    piecesPosition: TileInformation[],
    fromPosition: string,
    toPosition: string,
    isBlackPlayer: boolean
): boolean {
    // Simulate the move
    const simulatedPosition = piecesPosition.filter(
        (piece) => piece.position !== fromPosition && piece.position !== toPosition
    );
    
    const movingPiece = piecesPosition.find(p => p.position === fromPosition);
    if (!movingPiece) return false;
    
    simulatedPosition.push({
        position: toPosition,
        piece: movingPiece.piece,
        pieceController: movingPiece.pieceController,
    });

    // Find the king's position after the move
    const kingPosition = simulatedPosition
        .find(piece => 
            piece.pieceController.isBlack === isBlackPlayer && 
            piece.pieceController.pieceType === PIECE_TYPES.KING
        )
        ?.position;

    if (!kingPosition) return true; // If no king found, definitely in trouble!

    // Check if any opponent piece can attack the king
    const opponentPieces = simulatedPosition.filter(
        piece => piece.pieceController.isBlack !== isBlackPlayer
    );

    for (const opponentPiece of opponentPieces) {
        const opponentMoves = opponentPiece.pieceController.getValidMoves(
            PositionUtils.splitString(opponentPiece.position),
            simulatedPosition,
            !isBlackPlayer
        );
        
        if (opponentMoves.includes(kingPosition)) {
            return true; // King would be in check
        }
    }

    return false; // King is safe
}
