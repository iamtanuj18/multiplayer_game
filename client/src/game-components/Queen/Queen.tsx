import Piece from '../Piece';
import { Pieces } from '../../constants'

interface QueenProps {
  isBlack: boolean;
}

function Queen(props: QueenProps) {
    return <Piece pieceName={props.isBlack ? Pieces.BLACK_QUEEN : Pieces.WHITE_QUEEN}></Piece>
}

export default Queen;