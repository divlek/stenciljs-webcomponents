import { Component, h } from "@stencil/core";


@Component({
    tag: 'my-small-component',
    styleUrl: 'my-small-component.scss',
    shadow: true,
  })
export class MySmallComponent {

    render() {
        return(
            <div class='my-div'>
                This is my small Shadow DOM component..
            </div>
        )
    }

}