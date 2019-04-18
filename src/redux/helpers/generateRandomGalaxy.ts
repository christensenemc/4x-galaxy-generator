import Galaxy from '../state/Galaxy';
import GalaxyBuilder from './GalaxyBuilder';

const GALAXY_WIDTH = 1000,
  GALAXY_HEIGHT = 1000;

export default function generateRandomGalaxy(): Galaxy {
  let builder = new GalaxyBuilder({
    numberOfStars:100,
    width:GALAXY_WIDTH,
    height:GALAXY_HEIGHT,
    randomSeed:'',
    minimumDistanceBetweenStars:40,
    maximumLaneDistance:250,
    preferredNumberOfConnections:4,
    minimumAngleBetweenLanes:20
  });

  return builder.build()
}
