import Piece from '../Piece';
import { Pieces } from '../../constants'

interface KnightProps {
  isBlack: boolean;
}

function Knight(props: KnightProps) {
    return <Piece pieceName={props.isBlack ? Pieces.BLACK_KNIGHT : Pieces.WHITE_KNIGHT}></Piece>
}

export default Knight;