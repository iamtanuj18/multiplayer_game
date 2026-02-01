import Piece from '../Piece';
import { Pieces } from '../../constants'

interface BishopProps {
  isBlack: boolean;
}

function Bishop(props: BishopProps) {
    return <Piece pieceName={props.isBlack ? Pieces.BLACK_BISHOP : Pieces.WHITE_BISHOP}></Piece>
}

export default Bishop;