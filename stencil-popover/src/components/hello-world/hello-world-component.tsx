import { Component, Prop, h, FunctionalComponent, Host } from "@stencil/core";


@Component({
    tag:'hello-world-component',
    styleUrl: 'hello-world.scss',
    shadow: true,
})
export class HelloWorldComponent {

    @Prop() name: string;
   
    render() {
        return (
            <Host class='my-host'>
                <div class='hello-world'>
                    Hello {this.name}, Welcome to Stenciljs!
                    <div class='button-div' part='button-div-part'>
                        <button part='button-part' onClick={(event: MouseEvent) => this._openAlertWindow(event)}> Say Hello </button>
                    </div>
                    <MySvgText height={60} width={200} x={0} y={15} class='my-svg-text' />
                    <Poly height={210} width={500} points="200,10 250,190 160,210" style={{ fill: 'lime', stroke: 'purple', strokeWidth: 1 }} />
                </div>              
            </Host>
        )
    }

    /*
    private _getPolyStyle(): any {
        const styleObj =  {
                fill:'lime',
                stroke:'purple',
                stroke-width:'1'};
        return styleObj;
    }
    */
    

    private _openAlertWindow(event: MouseEvent) {
        window.alert(`Hello World ${name}`);
    }

}

function MySvgText(props: MySvgTextProps) {
    return (
        <svg height={props.height} width={props.width} class={props.class}>
            <text x={props.x} y={props.y} fill="red" transform="rotate(30 20,40)">I love SVG</text>
        </svg>
    )
}

interface MySvgTextProps {
    height: number;
    width: number;
    x: number;
    y: number;
    class?: string | { [className: string]: boolean };
}

interface PolygonSvgProps {  
    height: number;
    width: number;
    points: string;
    style ?: { [key: string]: any; };
  }

 const Poly: FunctionalComponent<PolygonSvgProps> = (props: PolygonSvgProps) => (  
    <svg height={props.height} width={props.width}>
      <polygon points={props.points} style={props.style} />
    </svg>
  );