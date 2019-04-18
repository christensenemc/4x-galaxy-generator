import Galaxy, { Star, WarpLane, StarColor, Coordinates } from '../state/Galaxy';
import { values, uniqueId, random, times } from 'lodash';

const Delaunator = require('delaunator').default;
const generateVoronoi = require('voronoi-diagram')



export interface GalaxyBuilderConfig {
  randomSeed: string;
  numberOfStars: number;
  width: number;
  height: number;
  minimumDistanceBetweenStars: number;
  maximumLaneDistance: number;
  preferredNumberOfConnections: number;
  minimumAngleBetweenLanes: number;
}

function laneIdForStars(a:Star,b:Star): string{
  return [a.id,b.id].sort().join('_')
}

function distanceBetweenStars(a:Star,b:Star): number {
  return Math.sqrt(Math.pow(b.coordinates.x - a.coordinates.x,2) + Math.pow(b.coordinates.y - a.coordinates.y,2));
}

function svgToXY(coords:{x:number;y:number;},canvasHeight:number): {x:number; y:number;} {
  return {x:coords.x,y:canvasHeight - coords.y};
}

function voronoiToCoordinates(voronoi: {positions:number[][], cells:number[][]}): Coordinates[][] {
  const positionCoordinates: Coordinates[] = voronoi.positions.map(p => ({x: p[0], y: p[1]}));

  //TODO: REPLACE INFINITY WITH {x,y} BASED ON WHICH 

  return voronoi.cells.map(cell => cell.filter(positionIndex => positionIndex >= 0).map(positionIndex => positionCoordinates[positionIndex]));
}

// function normalizeCoordinate(coords:Coordinates,width:number,height:number): Coordinates {
//   const x = coords.x < 0 ? 0 : (coords.x > width ? width : coords.x),
//     y = coords.y < 0 ? 0 : (coords.y > height ? height : coords.y);

//   return {x:x,y:y};
// }

function generateLaneBetweenStars(a:Star,b:Star): WarpLane {
  return {
    id:laneIdForStars(a,b),
    starIds:[a.id,b.id],
    starCoordinates:[a.coordinates,b.coordinates],
    distance:distanceBetweenStars(a,b),
    active: true
  }
}

function generateRandomStarColor(): StarColor{
  const colorSeed = random(0,100);

  if(colorSeed < 5){
    return StarColor.BLUE;
  } else if(colorSeed < 15){
    return StarColor.WHITE;
  } else if(colorSeed < 25){
    return StarColor.YELLOW;
  } else if(colorSeed < 40){
    return StarColor.ORANGE;
  } else {
    return StarColor.RED;
  }
}

export default class GalaxyBuilder{

  private _stars: { [id: string]: Star } = {};
  private _warplanes: { [id: string]: WarpLane } = {};
  private _config: GalaxyBuilderConfig;

  constructor(config: GalaxyBuilderConfig){
    this._config = config;
  }

  private _generateStar(){
    var starisTooClose = true,
      numberOfPasses = 0;

    var star: Star = {
      id: uniqueId('star_'),
      numberOfConnections: 0,
      name:'',
      size:3,
      color:generateRandomStarColor(),
      coordinates:{
        x:random(20,this._config.width - 20),
        y:random(20,this._config.height - 20)
      },
      influenceMapCoordinates:[]
    };

    while(starisTooClose){
      starisTooClose = false;

      for(let neighbor of values(this._stars)){ 
        if(neighbor == star){
          continue;
        }

        if(distanceBetweenStars(star,neighbor) < this._config.minimumDistanceBetweenStars){
          starisTooClose = true;
          break;
        }
      }

      if(starisTooClose){
        star.coordinates.x = random(20,this._config.width - 20);
        star.coordinates.y = random(20,this._config.height - 20);

        numberOfPasses = numberOfPasses + 1;

        if(numberOfPasses > 100){
          throw new Error('Number of passes exceeded');
          break;
        }

      }
    }

    this._stars[star.id] = star;
  }

  private _generateLaneBetweenStars(a:Star,b:Star){
    if(!this._warplanes.hasOwnProperty(laneIdForStars(a,b))){
      this._warplanes[laneIdForStars(a,b)] = generateLaneBetweenStars(a,b);
    }
  }

  private _generateDelaunayTriangulation(){
    const starsArray = values(this._stars),
      delaunay = Delaunator.from(starsArray, (s: Star) => s.coordinates.x, (s: Star) =>s.coordinates.y),
      triangles: number[] = Array.from(delaunay.triangles);

    for(let i=0; i < triangles.length; i += 3){
      const firstStar: Star = starsArray[triangles[i]],
        secondStar: Star = starsArray[triangles[i+1]],
        thirdStar: Star = starsArray[triangles[i+2]];

      this._generateLaneBetweenStars(firstStar,secondStar);
      this._generateLaneBetweenStars(secondStar,thirdStar);
      this._generateLaneBetweenStars(firstStar,thirdStar);
    }
  }

  private _getLaneAngleFromStar(star: Star, lane: WarpLane): number {

    if(lane.starIds.indexOf(star.id) === 0){
      let origin = svgToXY(lane.starCoordinates[0],this._config.height),
        end = svgToXY(lane.starCoordinates[1],this._config.height),
        angleInRadians = Math.atan2(end.y - origin.y,end.x - origin.x),
        angleInDegrees = angleInRadians * 180 / Math.PI;

      return angleInDegrees > 0 ? angleInDegrees : 360 + angleInDegrees;

    } else if(lane.starIds.indexOf(star.id) === 1){
      let origin = svgToXY(lane.starCoordinates[1],this._config.height),
        end = svgToXY(lane.starCoordinates[0],this._config.height),
        angleInRadians = Math.atan2(end.y - origin.y,end.x - origin.x),
        angleInDegrees = angleInRadians * 180 / Math.PI;

      return angleInDegrees > 0 ? angleInDegrees : 360 + angleInDegrees;

    } else {
      throw Error('Lane does not leave from star');
    }
  }

  private _getNeighboringStarIds(id: string): string[] {

    return values(this._warplanes)
      .filter(lane => lane.active && lane.starIds.indexOf(id) >= 0)
      .map(lane => lane.starIds.indexOf(id) === 0 ? lane.starIds[1] : lane.starIds[0]);
  }

  private _getOutgoingLanes(id: string): WarpLane[] {
    return values(this._warplanes)
      .filter(lane => lane.active && lane.starIds.indexOf(id) >= 0)    
  }

  private _calculateNumberOfConnections() {
    for(let star of values(this._stars)){
      star.numberOfConnections = this._getNeighboringStarIds(star.id).length
    }    
  }

  private _isMapConnected(): boolean {
    let stars = values(this._stars);

    var searchedStarIds: string[] = [],
      toSearchStarIds: string[] = [];

    toSearchStarIds.push(stars[0].id);

    while(toSearchStarIds.length > 0) {
      let starId = toSearchStarIds.pop();

      if(starId){
        let neighborIds = this._getNeighboringStarIds(starId);

        for(let neighborId of neighborIds){
          if(searchedStarIds.indexOf(neighborId) < 0){
            toSearchStarIds.push(neighborId);
            searchedStarIds.push(neighborId);
          }
        }
      }
    }

    return stars.length === searchedStarIds.length;
  }
 
  private _removeLongestLanes(){
    let sortedLanes = values(this._warplanes).sort((a,b) => b.distance - a.distance)

    for(let lane of sortedLanes){
      if(lane.distance > this._config.maximumLaneDistance){
        lane.active = false;
        if(!this._isMapConnected()){
          lane.active = true;
        }
      }
    }
  }

  private _generateInfluenceMap(){
    const stars = values(this._stars),
      voronoi = generateVoronoi(stars.map(s => [s.coordinates.x,s.coordinates.y])),
      starsInfluenceMapCoordinates = voronoiToCoordinates(voronoi);

    for(let i=0; i < stars.length; i ++){
      stars[i].influenceMapCoordinates = starsInfluenceMapCoordinates[i];
    } 
  }




  private _removeUnstrategicLanes(){
    this._calculateNumberOfConnections();

    let sortedStars = values(this._stars).sort((a,b) => b.numberOfConnections - a.numberOfConnections);

    for(let star of sortedStars){
      let excessLanesCount = star.numberOfConnections - this._config.preferredNumberOfConnections;

      if(excessLanesCount > 0){
        let excessLanes = this._getNeighboringStarIds(star.id)
          .map(id => this._warplanes[laneIdForStars(star,this._stars[id])])
          .filter(lane => lane.active)
          .sort((a,b) => b.distance - a.distance);

        let removedCount = 0;

        for(let lane of excessLanes){
          if(removedCount > excessLanesCount){
            break;
          }

          lane.active = false;
          if(!this._isMapConnected()){
            lane.active = true;
          } else {
            removedCount = removedCount + 1;
          }
        }

        this._calculateNumberOfConnections();
        // for(let neighborId of this._getNeighboringStarIds(star.id)){
        //   let lane = this._warplanes[laneIdForStars(star,this._stars[neighborId])]
        //   console.log('LANE -> ',lane);
        // }
      }
    }
  }

  private _removeAcuteAngles(){
    let stars = values(this._stars);


    for(let star of stars){
      let sortedOutgoingLanes = this._getOutgoingLanes(star.id).sort((a,b) => this._getLaneAngleFromStar(star,a) - this._getLaneAngleFromStar(star,b));

      if(sortedOutgoingLanes.length > 1){
        for(let i = 0; i < sortedOutgoingLanes.length - 1; i++){
          let firstLane = sortedOutgoingLanes[i],  
            secondLane = sortedOutgoingLanes[i+1],
            lanesAngle = Math.abs(this._getLaneAngleFromStar(star,firstLane) - this._getLaneAngleFromStar(star,secondLane));
          if((lanesAngle < this._config.minimumAngleBetweenLanes) || (lanesAngle > 360 - this._config.minimumAngleBetweenLanes)){
            if(firstLane.distance > secondLane.distance){
              firstLane.active = false;
              if(!this._isMapConnected()){
                firstLane.active = true;
                secondLane.active = false;
                if(!this._isMapConnected()){
                  secondLane.active = true;
                }
              }
            }else {
              secondLane.active = false;
              if(!this._isMapConnected()){
                secondLane.active = true;
                firstLane.active = false;
                if(!this._isMapConnected()){
                  firstLane.active = true;
                }
              }              
            }
          }
        }
        // sortedOutgoingLanes.forEach( l => console.log('STAR =',star.id,'LANE =',l.id,'ANGLE =',this._getLaneAngleFromStar(star,l)))
        //SORT LANES BY ANGLE
        //COMPARE SETS OF LANES
        //IF ANGLE IS SMALLER THAN MINIMUM LANE ANGLE REMOVE
      }
    }
  }

  public build(): Galaxy {
    const startTime = Date.now();

    times(this._config.numberOfStars,() => this._generateStar());

    console.log(`STARS GENERATED AT ${(Date.now() - startTime)/1000} SECONDS`)

    this._generateDelaunayTriangulation();

    console.log(`DELAUNAY TRIANGULATION GENERATED AT ${(Date.now() - startTime)/1000} SECONDS`)

    this._removeLongestLanes();
    this._removeAcuteAngles();
    this._removeUnstrategicLanes();

    console.log(`CULLING LANES AT ${(Date.now() - startTime)/1000} SECONDS`);

    this._generateInfluenceMap();

    console.log(`GENERATING VORONOI INFLUENCE MAP AT ${(Date.now() - startTime)/1000} SECONDS`)

    console.log(`GENERATION TOOK ${(Date.now() - startTime)/1000} SECONDS`)

    return {
      stars: values(this._stars),
      warpLanes: values(this._warplanes).filter(lane => lane.active)
    }
  }

}