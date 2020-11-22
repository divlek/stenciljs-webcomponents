import { Component, h, State } from "@stencil/core";

@Component({
  tag: "app-home",
  styleUrl: "app-home.css",
  shadow: true,
})
export class AppHome {
  @State()
  private _breadcrumbData = [
    { header: `Home`, link: `\\` },
    { header: `Settings`, link: `\\home\\settings` },
  ];

  private addNewCrumb = () => {
    let newLink = { header: `New link`, link: `\\home\\settings` };
    this._breadcrumbData = [...this._breadcrumbData, newLink];
  };

  render() {
    return (
      <div class="app-home">
        <p>
          Welcome to the Stencil App Starter. You can use this starter to build
          entire apps all with web components using Stencil! Check out our docs
          on <a href="https://stenciljs.com">stenciljs.com</a> to get started.
        </p>

        <tf-breadcrumbs>
          {this._breadcrumbData.map((val) => {
            return (
              <tf-breadcrumb-link
                header={val.header}
                path={val.link}
              ></tf-breadcrumb-link>
            );
          })}
        </tf-breadcrumbs>

        <button onClick={this.addNewCrumb}>Add new breadcrumb</button>
        <stencil-route-link url="/profile/stencil">
          <button>Profile page</button>
        </stencil-route-link>
      </div>
    );
  }
}
