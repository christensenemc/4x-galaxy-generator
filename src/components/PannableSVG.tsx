import * as React from 'react';

import {ReactSVGPanZoom} from 'react-svg-pan-zoom'

interface PannableSVGProps {
  contentWidth: number;
  contentHeight: number;
  children: any;
  onZoom?(level: number): void
  onClick?(event: React.MouseEvent): void 
  getRef?(element: ReactSVGPanZoom | null): void
}

interface PannableSVGState {
  width: number;
  height: number;
  activeTool: string;
}

// const CustomToolBar: React.StatelessComponent = () => (<div></div>)

class PannableSVG extends React.Component<PannableSVGProps,{}> {
  private containerElement: HTMLDivElement | null;
  private handleResizeBound: () => void;

  readonly state: PannableSVGState = {
    width:0,
    height:0,
    activeTool:'none'
  }

  constructor(props:PannableSVGProps){
    super(props)

    this.handleResizeBound = this.handleResize.bind(this);
  }

  public componentDidMount(){
    window.addEventListener('resize',this.handleResizeBound);

    this.handleResize();
  }

  public componentWillUnmount(){
    window.removeEventListener('resize',this.handleResizeBound);
  }


  handleResize(){
    if(this.containerElement){
      let boundingBox: ClientRect = this.containerElement.getBoundingClientRect();

      this.setState({width:boundingBox.width,height:boundingBox.height});
    }
  }

  public render() {
    const {children, contentHeight, contentWidth, getRef } = this.props;

    const { width, height } = this.state;

    return (
      <div ref={e => this.containerElement = e} style={{height:'100%',width:'100%'}}>
        <ReactSVGPanZoom
          ref={el => {if(getRef){ getRef(el) }}}
          width={width}
          height={height}
          SVGBackground='#0f2026'
          background='#0f2026'
          scaleFactor={1}
          //@ts-ignore
          scaleFactorMin={0.5}
          //@ts-ignore
          scaleFactorMax={3}
          //@ts-ignore
          miniaturePosition='none'
          //@ts-ignore
          tool={'auto'}
          //@ts-ignore
          toolbarPosition='none'
          //@ts-ignore
          detectAutoPan={false}
        >
          <svg 
            width={contentWidth} 
            height={contentHeight}
            viewBox={`0 0 ${contentWidth} ${contentWidth}`}
          >
            {children}
          </svg>
        </ReactSVGPanZoom>
      </div>
    );
  }
}

export default PannableSVG;
