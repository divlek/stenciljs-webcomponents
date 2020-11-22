import {
  Component,
  Element,
  h,
  Host,
  Prop,
  Watch,
  Method,
  State,
  Event,
  EventEmitter,
} from '@stencil/core';

/**
 * A simple tree view item, which represents a node within the tf-tree control.
 * @slot header The slot for the node content. If not set assigns the @prop 'header' value to the node content
 * @part expand-icon The icon that can be used to expand or collapse this node when it is not a leaf node.
 * @part loader The `div` that will contain the loader icon.
 * @part children-panel The `div` that will contain all of the children when the node is expanded.
 */
@Component({
  tag: 'tf-treeview-item',
  styleUrl: 'treeview-item.scss',
  shadow: true,
})
export class TreeviewItem {
  /**
   * The header text to display for this item.
   */
  @Prop() header?: string;

  /**
   * Gets or sets a value specifying whether this item is expanded and showing its children
   */
  @Prop({ reflect: true }) expanded: boolean = false;

  /**
   * Specifies that this item in the tree is a leaf and cannot be expanded
   */
  @Prop({ reflect: true }) leaf: boolean = false;

  /**
   * This property can be used to carry around a reference to an object or unique identifier for this node's data.
   */
  @Prop() data?: any;

  /**
   * This property is to set if the node item is loading its children. Shows a spinner indiciator in place of expand/collapse
   */
  @Prop() loading?: boolean = false;

  @State() private _focus: boolean = false;

  /**
   * Raised when the expanded state of this item changes.
   * This can be used to dynamically load the children or even remove the children.
   */
  @Event({ bubbles: true, cancelable: false }) expandedChanged!: EventEmitter<{
    element: HTMLTfTreeviewItemElement;
    expanded: boolean;
    data: any;
  }>;

  @Event({ bubbles: true, cancelable: false }) nodeSelected!: EventEmitter<{
    element: HTMLTfTreeviewItemElement;
    data: any;
  }>;

  /**
   * Event emitted when mouseover the node item. Returns an object which has reference to the context menu HTMLElement and the node data.
   * Can be used to render context menu icon launcher.
   */
  @Event() tfTreeItemMouseOver!: EventEmitter<{
    element: HTMLTfTreeviewItemElement;
    data: any;
  }>;

  /**
   * Event emitted when mouseout the item. Returns an object which has reference to the context menu HTMLElement and the node data.
   * Can be used to render context menu icon launcher.
   */
  @Event() tfTreeItemMouseOut!: EventEmitter<{
    element: HTMLTfTreeviewItemElement;
    data: any;
  }>;

  @Element()
  _hostEl!: HTMLElement;

  @State() private _transitioning = false;

  @Watch('expanded')
  protected _watchExpanded(value: boolean): void {
    this._transitioning = true;
    this.expandedChanged.emit({ element: this._hostEl as any, expanded: value, data: this.data });
  }

  @Method()
  async expandAll() {
    this.expanded = true;
    this._hostEl
      .querySelectorAll('tf-treeview-item')
      .forEach((el) => (el.expanded = el.leaf ? false : true));
  }

  @Method()
  async collapseAll() {
    this.expanded = false;
    this._hostEl.querySelectorAll('tf-treeview-item').forEach((el) => (el.expanded = false));
  }

  @Method()
  async setFocus() {
    this._focus = true;
  }

  @Method()
  async unFocus() {
    this._focus = false;
  }

  private _toggleExpansion = () => {
    this.expanded = !this.leaf && !this.expanded;
  };

  private _selectNode = () => {
    //console.log('_selectNode');
    this.nodeSelected.emit({ element: this._hostEl as any, data: this.data });
  };

  private _transitionEnd = () => (this._transitioning = false);

  private _handleMouseOver = (ev: MouseEvent) => {
    ev.stopPropagation();
    this.tfTreeItemMouseOver.emit({ element: this._hostEl as any, data: this.data });
  };

  private _handleMouseOut = (ev: MouseEvent) => {
    ev.stopPropagation();
    this.tfTreeItemMouseOut.emit({ element: this._hostEl as any, data: this.data });
  };

  componentDidLoad() {
    const slottedElement = this._hostEl.shadowRoot.querySelector('slot[name="header"]');
    slottedElement.addEventListener('click', () => {
      console.log('slot clicked');
      this._selectNode();
    });
  }

  render() {
    const { expanded, header } = this;

    return (
      <Host class='curr-level'>
        <div
          class={{ header: true, 'focus-node': this._focus }}
          onMouseOver={this._handleMouseOver}
          onMouseOut={this._handleMouseOut}
        >
          {this.loading ? (
            <div part='loader' />
          ) : (
            <div part='expand-icon' onClick={this._toggleExpansion} />
          )}

          <slot name='header'>
            <div>{header}</div>
          </slot>
        </div>
        {(expanded || this._transitioning) && (
          <div part='children-panel' onTransitionEnd={this._transitionEnd}>
            <slot />
          </div>
        )}
      </Host>
    );
  }
}
