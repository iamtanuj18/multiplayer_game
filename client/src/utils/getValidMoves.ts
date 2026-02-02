
import { ARRAY_OF_TILES } from '../constants';
import { TileInformation } from '../models';
import { PositionUtils } from '.';
import { PieceController } from '../models/pieceController';
import { wouldBeInCheck } from './wouldBeInCheck';

export function getValidMoves(
    piecesPosition: TileInformation[],
    selectedPieceTile: TileInformation | undefined,
    isBlackTurn: boolean
) {
    if (selectedPieceTile != null) {
        const selectedPiecePosition = PositionUtils.splitString(selectedPieceTile?.position);
        const movingPiece: PieceController = selectedPieceTile.pieceController;
        const allPossibleMoves = movingPiece.getValidMoves(selectedPiecePosition, piecesPosition, isBlackTurn) ?? ARRAY_OF_TILES;
        
        // Filter out moves that would leave/put the king in check
        const legalMoves = allPossibleMoves.filter(move => 
            !wouldBeInCheck(piecesPosition, selectedPieceTile.position, move, isBlackTurn)
        );
        
        return legalMoves;
    } else {
        return piecesPosition.filter(tile => tile.pieceController.isBlack === isBlackTurn).map(tile => tile.position);
    }
}