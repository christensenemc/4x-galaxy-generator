import * as React from 'react';

import { Star, StarColor } from '../redux/state/Galaxy';

export enum LabelDetailLevel {
  NONE = 'NONE',
  NAME = 'NAME',
  NAME_AND_RESOURCES = 'NAME_AND_RESOURCES'
}


interface StrategyMapStarProps {
  labelDetailLevel: LabelDetailLevel;
  showInfluenceMap: boolean;
  selected:boolean;
  star: Star;
  onClick?(star: Star): void; 
  onDoubleClick?(star: Star): void;
  onMouseOver?(star: Star): void; 
}

export default class StrategyMapStar extends React.Component<StrategyMapStarProps> {
  handleClick(event: React.TouchEvent | React.MouseEvent){
    event.preventDefault();
    event.stopPropagation();

    if(this.props.onClick){
      this.props.onClick(this.props.star);
    }
  }

  handleMouseOver(event: React.TouchEvent | React.MouseEvent){
    event.preventDefault();
    event.stopPropagation();

    if(this.props.onMouseOver){
      this.props.onMouseOver(this.props.star);
    }
  }

  handleDoubleClick(event:React.MouseEvent){
    event.preventDefault();
    event.stopPropagation();

    if(this.props.onDoubleClick){
      this.props.onDoubleClick(this.props.star);
    }
  }

  getStarColor(){
    const color = this.props.star.color;

    switch (color) {
      case StarColor.BLUE:
        return '#b0cafd'
        break;

      case StarColor.WHITE:
        return '#fff4f3'
        break;

      case StarColor.YELLOW:
        return '#fee5d1'
        break;

      case StarColor.ORANGE:
        return '#fec792'
        break;

      case StarColor.RED:
        return '#fda559'
        break;


      default:
        return 'white';
        break;
    }
  }

  render(){
    const { star, selected, labelDetailLevel, showInfluenceMap } = this.props

    return (
      <g 
        cursor='pointer'
        onTouchStart={e => this.handleClick(e)}
        onDoubleClick={e => this.handleDoubleClick(e)} 
        onClick={e => this.handleClick(e)}
      >
        <circle 
          fill='transparent' 
          stroke='transparent' 
          cx={star.coordinates.x}
          cy={star.coordinates.y}
          r={20}
        />
        <circle 
          stroke={selected ? this.getStarColor() : '#0f2026'}
          fill='#0f2026'
          cx={star.coordinates.x}
          cy={star.coordinates.y}
          r={10}
          strokeWidth={2}
        />
        <circle 
          cx={star.coordinates.x}
          cy={star.coordinates.y}
          fill={this.getStarColor()}
          r={5}
        />  
        {labelDetailLevel === LabelDetailLevel.NAME && (
          <text
            fontSize='10'
            fill={selected ? 'white' : '#757575'}

            x={star.coordinates.x}
            y={star.coordinates.y + 20}
            textAnchor='middle'
          >
            {this.props.star.id}
          </text>  
        )} 
        {showInfluenceMap && (
          <polygon 
            points={star.influenceMapCoordinates.map(c => `${c.x},${c.y}`).join(' ')}
            fill={selected ? 'red' : 'transparent'}
            stroke='red'
            opacity={0.3}
          />
        )}   
      </g>
    )
  }
}