import * as React from 'react';

import { ReactSVGPanZoom } from 'react-svg-pan-zoom'
import StrategyMapStar,{ LabelDetailLevel } from './components/StrategyMapStar';
import PannableSVG from './components/PannableSVG';

import Galaxy,{Star} from './redux/state/Galaxy';
import generateRandomGalaxy from './redux/helpers/generateRandomGalaxy';
// import * as screenfull from 'screenfull';

import './App.css';

interface AppState {
  galaxy: Galaxy | null;
  selectedEntity: 'STAR' | 'FLEET' | null;
  selectedEntityId: string | null;
  zoomLevel: number;
  visibleStars: string[];
}


class App extends React.Component<{},AppState> {
  private panZoomElement: ReactSVGPanZoom | null;

  readonly state: AppState = { 
    galaxy : null, 
    selectedEntity: null ,
    selectedEntityId: null,
    zoomLevel:1,
    visibleStars:[]
  }

  public componentDidMount(){
    const galaxy = generateRandomGalaxy();

    this.setState({ galaxy: galaxy });
  }

  handleStarClick(star: Star){
    console.log('CLICKED STAR ',star);
    this.setState({ selectedEntity:'STAR', selectedEntityId:star.id });
  }

  handleStarDoubleClick(star: Star){
    console.log('STAR DOUBLE CLICKED');

    this.setState({ selectedEntity:'STAR', selectedEntityId:star.id });
    if(this.panZoomElement){
      console.log('PAN ZOOM =',this.panZoomElement);
      this.panZoomElement.setPointOnViewerCenter(star.coordinates.x,star.coordinates.y,1);
    } else {
      console.log('NO PAN ZOOM');
    }
  }

  public render() {
    const { 
      galaxy, 
      selectedEntity,
      selectedEntityId 
    } = this.state;

    return (
      <div className="App">
        <div className="SideBar"></div>
        <div className="Galaxy">
          {galaxy && (
            <PannableSVG 
              contentWidth={1000} 
              contentHeight={1000} 
              onZoom={(zoom) => this.setState({zoomLevel:zoom})}
              getRef={(el) => this.panZoomElement = el}
            >
              {galaxy.warpLanes.map(lane => (
                <line 
                  key={lane.starIds[0] +'_'+lane.starIds[1]}
                  stroke='#757575'
                  x1={lane.starCoordinates[0].x} 
                  y1={lane.starCoordinates[0].y}
                  x2={lane.starCoordinates[1].x}
                  y2={lane.starCoordinates[1].y}
                  onClick={(e) => console.log('CLICKED LANE',lane)}
                />
              ))}
              {galaxy.stars.map( star => ( 
                <StrategyMapStar 
                  key={star.id} 
                  labelDetailLevel={LabelDetailLevel.NAME}
                  selected={selectedEntity === 'STAR' && star.id === selectedEntityId}
                  star={star} 
                  onClick={(star) => this.handleStarClick(star)}
                  onDoubleClick={(star) => this.handleStarDoubleClick(star)}
                  showInfluenceMap={false}
                /> 
              ))}
            </PannableSVG>
          )}
        </div>
      </div>
    );
  }
}

export default App;
