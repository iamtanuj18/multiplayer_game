import Piece from '../Piece';
import { Pieces } from '../../constants'

interface KingProps {
  isBlack: boolean;
}

function King(props: KingProps) {
    return <Piece pieceName={props.isBlack ? Pieces.BLACK_KING : Pieces.WHITE_KING}></Piece>
}

export default King;