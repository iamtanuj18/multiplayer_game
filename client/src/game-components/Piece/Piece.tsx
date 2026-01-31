interface PieceProps {
  pieceName: string;
}

function Piece(props: PieceProps) {
    return (
        <span dangerouslySetInnerHTML={{__html: `${props.pieceName}`}}></span>
    );
}

export default Piece;