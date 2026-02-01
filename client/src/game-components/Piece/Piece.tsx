interface PieceProps {
  pieceName: string;
}

function Piece(props: PieceProps) {
    // Determine if this is a black piece (unicode range \u265A-\u265F)
    const isBlackPiece = props.pieceName.includes('265A') || 
                         props.pieceName.includes('265B') || 
                         props.pieceName.includes('265C') || 
                         props.pieceName.includes('265D') || 
                         props.pieceName.includes('265E') || 
                         props.pieceName.includes('265F');
    
    const style = {
        color: isBlackPiece ? '#1a1a1a' : '#ffffff',
        textShadow: isBlackPiece 
            ? '0 0 2px #000, 0 0 3px #000' 
            : '0 0 2px #000, 0 0 3px #000, 0 0 1px #666',
        filter: isBlackPiece ? 'brightness(0.9)' : 'brightness(1.3)'
    };
    
    return (
        <span 
            style={style}
            dangerouslySetInnerHTML={{__html: `${props.pieceName}`}}
        ></span>
    );
}

export default Piece;