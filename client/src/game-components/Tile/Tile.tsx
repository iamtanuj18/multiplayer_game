import './Tile.css';
import { ReactNode } from 'react';

interface TileProps {
  isBlackTile: boolean;
  isSelected: boolean;
  isValid: boolean;
  isCapture: boolean;
  pieceSelected: boolean;
  position: string;
  handleClick: (position: string, piece: JSX.Element | null) => void;
  children?: ReactNode;
}

function Tile(props: TileProps) {
    const handleClick = () => {
        // Allow clicking if it's a valid move OR if there's a piece here (to select/switch pieces)
        if (props.isValid || props.children) {
            props.handleClick(props.position, props.children as JSX.Element | null)
        }
    };
    return (
        <div 
            className={`
                piece
                ${props.isBlackTile ? 'black' : 'white'}
                ${props.isSelected ? 'selected' : ''}
                ${props.isValid ? 'valid' : ''}
                ${props.isCapture ? 'capture' : ''}
                ${props.pieceSelected ? 'on-selection' : ''}
            `}
            id={props.position}
            onClick={handleClick}>
            {props.children}
            {!props.children && props.isValid ? <span className="circle"></span> : ''}
        </div>
    )
}

export default Tile;