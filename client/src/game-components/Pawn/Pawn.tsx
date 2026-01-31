import Piece from '../Piece';
import { Pieces } from '../../constants'

interface PawnProps {
  isBlack: boolean;
}

function Pawn(props: PawnProps) {
    return <Piece pieceName={props.isBlack ? Pieces.BLACK_PAWN : Pieces.WHITE_PAWN}></Piece>
}

export default Pawn;