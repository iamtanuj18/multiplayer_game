import './Tile.css';
import { ReactNode } from 'react';

interface TileProps {
  isBlackTile: boolean;
  isSelected: boolean;
  isValid: boolean;
  pieceSelected: boolean;
  position: string;
  handleClick: (position: string, piece: JSX.Element | null) => void;
  children?: ReactNode;
}

function Tile(props: TileProps) {
    const handleClick = () => {
        if (props.isValid) {
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
                ${props.pieceSelected ? 'on-selection' : ''}
            `}
            id={props.position}
            onClick={handleClick}>
            {props.children}
            {!props.children ? <span className="circle"></span> : ''}
        </div>
    )
}

export default Tile;