import { Component, h, State, JSX } from '@stencil/core';
import { Group } from './icons';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss',
  shadow: true,
})
export class AppHome {
  @State()
  private _lazyLoadedDataRoot: DataNode;

  @State() _showContextMenu = false;

  @State()
  private _lazyLoadedDataVaultRoot: DataVaultNode = {
    header: 'Luna Repository',
    id: '/',
    children: [],
    type: 'root',
  };

  componentWillLoad() {
    setTimeout(
      () =>
        (this._lazyLoadedDataRoot = {
          header: 'Root3 (LazyLoaded)',
          id: Date.now().toString(),
          children: [],
          type: 'root',
        }),
      2000
    );
  }

  private _treeNodeExpandedChanged = (
    e: CustomEvent<{ element: HTMLTfTreeviewItemElement; expanded: boolean; data: any }>
  ): void => {
    e.stopPropagation();
    const detail = e.detail;
    if (detail.expanded) {
      // NOTE: We could load some stuff dynamically here
      let data = detail.data;
      let element = detail.element;
      let node = this._findNodeById(this._lazyLoadedDataRoot, data.id);
      if (!node) {
        return;
      }
      let origHeading = node.header;
      element.loading = true;
      node.header = 'Loading...';
      node.children = [];
      this._lazyLoadedDataRoot = { ...this._lazyLoadedDataRoot };
      setTimeout(() => {
        console.log(detail.data);
        node = this._findNodeById(this._lazyLoadedDataRoot, data.id);
        node.children = [
          {
            id: `${node.id}_1_${Date.now()}`,
            header: 'Child1',
            children: [],
            type: 'child',
          },
          {
            id: `${node.id}_2_${Date.now()}`,
            header: 'Child2',
            children: [],
            type: 'child',
          },
        ];
        element.loading = false;
        node.header = origHeading;
        this._lazyLoadedDataRoot = { ...this._lazyLoadedDataRoot };
      }, 1000);

      /*
      if (detail.element.children.length === 0) {
        // After dynamically loading, it does not have children, mark it as a leaf node.
        detail.element.expanded = false;
        detail.element.leaf = true;
      }
      */
    }
  };

  private _treeNodeDataVaultExpandedChanged = (
    e: CustomEvent<{ element: HTMLTfTreeviewItemElement; expanded: boolean; data: any }>
  ): void => {
    e.stopPropagation();
    const detail = e.detail;
    if (detail.expanded) {
      // NOTE: We could load some stuff dynamically here
      let data = detail.data;
      let element = detail.element;
      let node = this._findNodeById(this._lazyLoadedDataVaultRoot, data.id);
      if (!node) {
        return;
      }
      let origHeading = node.header;
      element.loading = true;
      node.header = 'Loading...';
      node.children = [];
      this._lazyLoadedDataVaultRoot = { ...this._lazyLoadedDataVaultRoot };
      setTimeout(() => {
        // console.log(detail.data);
        node = this._findNodeById(this._lazyLoadedDataVaultRoot, data.id);
        const nodeType = node.type;
        let children = [];
        switch (nodeType) {
          case 'root':
            children = [
              {
                id: `${node.id}_1_${Date.now()}`,
                header: 'Folder1',
                children: [],
                type: 'folder',
              },
              {
                id: `${node.id}_2_${Date.now()}`,
                header: 'Folder2',
                children: [],
                type: 'folder',
              },
            ];
            break;
          case 'folder':
            children = [
              {
                id: `${node.id}_1_${Date.now()}`,
                header: 'Sequence1',
                children: [],
                type: 'sequence',
              },
              {
                id: `${node.id}_2_${Date.now()}`,
                header: 'Sequence2',
                children: [],
                type: 'sequence',
              },
            ];
            break;
          case 'sequence':
            children = [];
            element.leaf = true;
            break;
          default:
            break;
        }
        node.children = children;
        element.loading = false;
        node.header = origHeading;
        this._lazyLoadedDataVaultRoot = { ...this._lazyLoadedDataVaultRoot };
      }, 1000);

      /*
      if (detail.element.children.length === 0) {
        // After dynamically loading, it does not have children, mark it as a leaf node.
        detail.element.expanded = false;
        detail.element.leaf = true;
      }
      */
    }
  };

  private _findNodeById(
    node: DataNode | DataVaultNode,
    nodeId: string
  ): DataNode | DataVaultNode | null {
    if (node.id === nodeId) {
      return node;
    }
    for (let index = 0; index < node.children.length; index++) {
      const childNode = node.children[index];
      if (childNode.id === nodeId) {
        return childNode;
      }
      const childSearch = this._findNodeById(childNode, nodeId);
      if (childSearch) return childSearch;
    }
    return null;
  }

  private _renderLazyLoadedTree(node: DataNode): JSX.Element {
    if (!node) {
      return;
    }
    return (
      <tf-treeview-item
        header={node.header}
        data={node}
        onExpandedChanged={this._treeNodeExpandedChanged}
      >
        {node.children &&
          node.children.length > 0 &&
          node.children.map((item: DataNode) => this._renderLazyLoadedTree(item))}
      </tf-treeview-item>
    );
  }

  private _renderLazyLoadedContentProjectedTree(node: DataVaultNode): JSX.Element {
    if (!node) {
      return;
    }
    return (
      <tf-treeview-item
        data={node}
        leaf={node.type === 'sequence'}
        onExpandedChanged={this._treeNodeDataVaultExpandedChanged}
        onTfTreeItemMouseOver={(event: CustomEvent) => this._showPopUp(event, node)}
        onTfTreeItemMouseOut={(event: CustomEvent) => this._hidePopUp(event, node)}
      >
        {/* TODO:- Hardcoded the svg image location using image tags for now, move it to icon components   */}
        <div slot='header' class='header-content'>
          <div class='header-left-content'>
            {node.type === 'root' && (
              <span class='tfi'>
                <img src={'/assets/icon/icon_server.svg'} />
              </span>
            )}
            {node.type === 'sequence' && (
              <span class='tfi'>
                <img src={'/assets/icon/icon_sequence.svg'} />
              </span>
            )}
            {node.type === 'folder' && (
              <span class='tfi'>
                <img src={'/assets/icon/icon_folder_closed.svg'} />
              </span>
            )}
            <div class='spring'>{node.header}</div>
          </div>
          {node.showContextMenu && (
            <span class='group-icon' onClick={this._handleContextMenuClick}>
              <Group />
            </span>
          )}
        </div>
        {node.children &&
          node.children.length > 0 &&
          node.children.map((item: DataVaultNode) =>
            this._renderLazyLoadedContentProjectedTree(item)
          )}
      </tf-treeview-item>
    );
  }

  private _handleContextMenuClick = (ev: MouseEvent) => {
    ev.stopPropagation();
    alert('Show context menu popover with action items');
  };

  private _showPopUp(ev: CustomEvent, node: DataVaultNode) {
    if (ev) {
      ev.stopPropagation();
    }

    node.showContextMenu = true;
    this._lazyLoadedDataVaultRoot = { ...this._lazyLoadedDataVaultRoot };
    //console.log('_showPopUp '+JSON.stringify(node));
  }

  private _hidePopUp(ev: CustomEvent, node: DataVaultNode) {
    if (ev) {
      ev.stopPropagation();
    }
    node.showContextMenu = false;
    this._lazyLoadedDataVaultRoot = { ...this._lazyLoadedDataVaultRoot };
    //console.log('_hidePopUp '+JSON.stringify(node));
  }

  private _handleFocusChange = (
    ev: CustomEvent<{
      oldValue: { element: HTMLTfTreeviewItemElement; data: any };
      newValue: { element: HTMLTfTreeviewItemElement; data: any };
    }>
  ) => {
    ev.stopPropagation();
    if (ev.detail.newValue) {
      this._showPopUp(null, ev.detail.newValue.data);
    }

    if (ev.detail.oldValue) {
      this._hidePopUp(null, ev.detail.oldValue.data);
    }
  };

  render() {
    const testChildren = [
      {
        header: 'Child1',
      },
      {
        header: 'Child2',
      },
    ];

    const testData: DemoNodeProps = {
      header: 'DemoNodeRoot',
      children: testChildren,
    };

    return (
      <div class='app-home'>
        <p>
          Welcome to the Stencil App Starter. You can use this starter to build entire apps all with
          web components using Stencil! Check out our docs on
          <a href='https://stenciljs.com'>stenciljs.com</a> to get started.
        </p>

        <div class='demo-content'>
          <div class='demo'>
            <h2>Default Styling</h2>
            <tf-tree>
              <tf-treeview-item header='Root1'>
                <tf-treeview-item>
                  <span slot='header' class='tfi folder' />
                  <div slot='header' class='spring'>
                    This is a test of some pretty long text that will probably be clipped before
                    this.
                  </div>
                  <span slot='header' class='tfi context-menu' />
                  <tf-treeview-item leaf header='One' />
                  <tf-treeview-item leaf header='Two' />
                  <tf-treeview-item leaf header='Three' />
                  <tf-treeview-item leaf header='Four' />
                  <tf-treeview-item leaf header='Five' />
                  <tf-treeview-item
                    leaf
                    header='This is a really long header that will probably be chopped off.'
                  />
                </tf-treeview-item>
                <tf-treeview-item header='Thing'>
                  <tf-treeview-item header='One' />
                  <tf-treeview-item header='Two' />
                  <tf-treeview-item header='Three' />
                  <tf-treeview-item header='Four' />
                  <tf-treeview-item header='Five' />
                </tf-treeview-item>
                <tf-treeview-item header='Some other thing'>
                  <tf-treeview-item header='One' />
                  <tf-treeview-item header='Two' />
                  <tf-treeview-item header='Three' />
                  <tf-treeview-item header='Four' />
                  <tf-treeview-item header='Five'>
                    <tf-treeview-item header='Five-One' />
                    <tf-treeview-item header='Five-Two' />
                    <tf-treeview-item header='Five-Three' />
                  </tf-treeview-item>
                </tf-treeview-item>
                {/*  <DemoNode {...testData}/> */}
              </tf-treeview-item>
              <tf-treeview-item header='Root2'>
                <tf-treeview-item header='Some other thing'>
                  <tf-treeview-item header='One' />
                  <tf-treeview-item header='Two' />
                  <tf-treeview-item header='Three' />
                  <tf-treeview-item header='Four' />
                  <tf-treeview-item header='Five'>
                    <tf-treeview-item header='Five-One' />
                    <tf-treeview-item header='Five-Two' />
                    <tf-treeview-item header='Five-Three' />
                  </tf-treeview-item>
                </tf-treeview-item>
              </tf-treeview-item>
              <DemoNode {...testData} />
            </tf-tree>
          </div>

          <div class='demo'>
            <h2>Lazy loading example</h2>
            <tf-tree class='lazy-load-tree'>
              {this._renderLazyLoadedTree(this._lazyLoadedDataRoot)}
            </tf-tree>
          </div>

          <div class='demo'>
            <h2>Lazy loading with content projection</h2>
            <tf-tree class='lazy-load-tree' onFocusChanged={this._handleFocusChange}>
              {this._renderLazyLoadedContentProjectedTree(this._lazyLoadedDataVaultRoot)}
            </tf-tree>
          </div>

          <div class='demo'>
            <h2>Somewhat Restyled with Pizza</h2>
            <tf-tree class='pizza'>
              <tf-treeview-item header='Root'>
                <tf-treeview-item>
                  <span slot='header' class='tfi folder' />
                  <div slot='header' class='spring'>
                    This is a test of some pretty long text that will probably be clipped before
                    this.
                  </div>
                  <span slot='header' class='tfi context-menu' />
                  <tf-treeview-item leaf header='One' />
                  <tf-treeview-item leaf header='Two' />
                  <tf-treeview-item leaf header='Three' />
                  <tf-treeview-item leaf header='Four' />
                  <tf-treeview-item leaf header='Five' />
                  <tf-treeview-item
                    leaf
                    header='This is a really long header that will probably be chopped off.'
                  />
                </tf-treeview-item>
                <tf-treeview-item header='Thing'>
                  <tf-treeview-item header='One' />
                  <tf-treeview-item header='Two' />
                  <tf-treeview-item header='Three' />
                  <tf-treeview-item header='Four' />
                  <tf-treeview-item header='Five' />
                </tf-treeview-item>
                <tf-treeview-item header='Some other thing'>
                  <tf-treeview-item header='One' />
                  <tf-treeview-item header='Two' />
                  <tf-treeview-item header='Three' />
                  <tf-treeview-item header='Four' />
                  <tf-treeview-item header='Five' />
                </tf-treeview-item>
              </tf-treeview-item>
            </tf-tree>
          </div>
        </div>

        <stencil-route-link url='/profile/stencil'>
          <button>Profile page</button>
        </stencil-route-link>
      </div>
    );
  }
}

interface DemoNodeProps {
  header: string;
  children?: DemoNodeProps[];
}

function DemoNode(props: DemoNodeProps) {
  let treeNodeExpandedChanged = (
    e: CustomEvent<{ element: HTMLTfTreeviewItemElement; expanded: boolean; data: any }>
  ): void => {
    const detail = e.detail;
    console.log(detail.element.header, detail);
    if (detail.expanded) {
      // NOTE: We could load some stuff dynamically here
      props.header = 'Loading';
      setTimeout(data => {
        console.log(data);
        props.children = [
          {
            header: 'Child1',
          },
          {
            header: 'Child2',
          },
        ];

        props = { ...props };
      }, 3000);
    }
  };

  return (
    <tf-treeview-item onExpandedChanged={treeNodeExpandedChanged}>
      <span slot='header' class='tfi folder' />
      <div slot='header' class='spring'>
        {props.header}
      </div>
      <span slot='header' class='tfi context-menu' />
      {props.children &&
        props.children.length > 0 &&
        props.children.map((prop: DemoNodeProps) => (
          <DemoNode header={prop.header} children={prop.children} />
        ))}
    </tf-treeview-item>
  );
}

export interface DataNode {
  id: string;
  header: string;
  children: DataNode[];
  type: 'root' | 'child';
}

export interface DataVaultNode {
  id: string;
  header: string;
  children: DataVaultNode[];
  type: 'root' | 'folder' | 'sequence';
  showContextMenu?: boolean;
}
