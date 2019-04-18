export enum StarColor {
  BLUE,
  WHITE,
  YELLOW,
  ORANGE,
  RED
}

export interface Coordinates {
  x: number; 
  y: number;  
}

export interface Star {
  id: string;
  name: string;
  size: number;
  coordinates: Coordinates;
  color:StarColor,
  numberOfConnections: number;
  influenceMapCoordinates: Coordinates[]
}

export interface WarpLane {
  id: string;
  starIds:[ string, string ];
  starCoordinates:[ Coordinates, Coordinates ];
  distance: number;
  active: boolean;
}

export default interface Galaxy {
  stars: Star[];
  warpLanes: WarpLane[]; //USE MAPS FOR BOTH OF THESE
}