import Piece from '../Piece';
import { Pieces } from '../../constants'

interface RookProps {
  isBlack: boolean;
}

function Rook(props: RookProps) {
    return <Piece pieceName={props.isBlack ? Pieces.BLACK_ROOK : Pieces.WHITE_ROOK}></Piece>
}

export default Rook;