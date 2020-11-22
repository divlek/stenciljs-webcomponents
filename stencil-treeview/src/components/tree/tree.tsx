import { Component, h, Listen, Host, Element, Method, Event, EventEmitter } from '@stencil/core';

/**
 * A tree control, which is a wrapper for a nested list of 'tf-treeview-item' nodes.
 * Content projects the nested list of 'tf-treeview-item' nodes into this control and supports
 * focus management and keyboard based interations for the node tree navigation, selection, expand/collapse.
 */
@Component({
  tag: 'tf-tree',
  styleUrl: 'tree.scss',
  shadow: true,
})
export class Tree {
  @Element() _hostEl!: HTMLElement;
  private _currFocusedNode!: HTMLTfTreeviewItemElement;
  private _currSelectedNode!: HTMLTfTreeviewItemElement;

  /**
   * Raised when the focused node is changed.
   */
  @Event({ bubbles: true, cancelable: false }) focusChanged!: EventEmitter<{
    oldValue: { element: HTMLTfTreeviewItemElement; data: any } | null;
    newValue: { element: HTMLTfTreeviewItemElement; data: any } | null;
  }>;

  /**
   * Raised when the focused node is selected, when user presses key 'Enter'.
   */
  @Event({ bubbles: true, cancelable: false }) selectionChanged!: EventEmitter<{
    element: HTMLTfTreeviewItemElement;
    data: any;
  }>;

  @Listen('focusin')
  protected _handleFocusIn() {
    console.log('FocusIn');
    if (!this._currFocusedNode) {
      this._focusFirstVisibleNode();
    }
  }

  @Listen('expandedChanged', { capture: true })
  protected _handleExpandedChanged(
    ev: CustomEvent<{ element: HTMLTfTreeviewItemElement; expanded: boolean; data: any }>
  ) {
    const eventDetail = ev.detail;
    if (eventDetail) {
      //Change focus to the expanded element.
      this._setFocusNode(eventDetail.element);
      //Set the current selected element
      // this._selectCurrentNode();
    }
  }

  @Listen('nodeSelected', { capture: true })
  protected _handleNodeSelected(
    ev: CustomEvent<{ element: HTMLTfTreeviewItemElement; data: any }>
  ) {
    const eventDetail = ev.detail;
    if (eventDetail) {
      //Change focus to the expanded element.
      this._setFocusNode(eventDetail.element);
      //Set the current selected element
      this._selectCurrentNode();
    }
  }

  @Method()
  async getSelectedNode(): Promise<HTMLTfTreeviewItemElement> {
    return Promise.resolve(this._currSelectedNode);
  }

  @Listen('keydown')
  protected _handleKeyDown(ev: KeyboardEvent) {
    switch (ev.key) {
      case KeyCodes.ArrowUp:
        this._focusNodeAbove(); // Focus the next visible node above
        break;
      case KeyCodes.ArrowDown:
        this._focusNodeBelow(); // Focus the next visible node below
        break;
      case KeyCodes.ArrowRight:
        this._expandOrFocusFirstChild(); // Expand or focus first child
        break;
      case KeyCodes.ArrowLeft:
        this._collapseOrFocusParent(); // Collapse or focus the parent
        break;
      case KeyCodes.Enter:
        this._selectCurrentNode(); // Select the current node
        break;
      case KeyCodes.Home:
        this._focusFirstVisibleNode(); // Focus first visible node in tree
        break;
      case KeyCodes.End:
        this._focusLastVisibleNode(); // Focus last visible node in tree
        break;
      default:
        break;
    }
  }

  private _expandOrFocusFirstChild(): void {
    // If node not already expanded, expand the node
    if (!this._currFocusedNode.expanded) {
      this._currFocusedNode.expanded = true;
    } else {
      // Focus the first child
      this._focusFirstChild();
    }
  }

  private _collapseOrFocusParent(): void {
    // If node not already collapsed, collapse the node
    if (this._currFocusedNode.expanded) {
      this._currFocusedNode.expanded = false;
    } else {
      // Focus the parent node
      this._focusParentNode();
    }
  }

  private _focusParentNode(): void {
    if (!this._currFocusedNode) {
      this._focusFirstVisibleNode();
      return;
    }
    if (
      this._currFocusedNode &&
      this._currFocusedNode.parentElement &&
      this._currFocusedNode.parentElement.nodeName.toLowerCase() === treeViewItemSelector
    ) {
      this._setFocusNode(this._currFocusedNode.parentElement as HTMLTfTreeviewItemElement);
    }
  }

  private _focusFirstChild(): void {
    if (!this._currFocusedNode) {
      this._focusFirstVisibleNode();
      return;
    }
    const childNodes = this._filterAllTreeViewItemNodes(this._currFocusedNode.children);
    if (childNodes && childNodes.length > 0) {
      this._setFocusNode(childNodes[0] as HTMLTfTreeviewItemElement);
    }
  }

  private _selectCurrentNode(): void {
    this._currSelectedNode = this._currFocusedNode;
    this.selectionChanged.emit({
      element: this._currSelectedNode,
      data: this._currSelectedNode ? this._currSelectedNode.data : null,
    });
  }

  private _focusFirstVisibleNode(): void {
    const firstVisibleNode = this._getFirstVisibleNode();
    if (firstVisibleNode) {
      this._setFocusNode(firstVisibleNode);
    }
  }

  private _getFirstVisibleNode(): HTMLTfTreeviewItemElement | null {
    if (!this._hostEl) {
      return null;
    }

    return this._hostEl.querySelector(treeViewItemSelector);
  }

  private _setFocusNode(node: HTMLTfTreeviewItemElement): void {
    if (!node) {
      return;
    }
    if (this._currFocusedNode) {
      this._currFocusedNode.unFocus();
      node.setFocus();
      this.focusChanged.emit({
        oldValue: { element: this._currFocusedNode, data: this._currFocusedNode.data },
        newValue: { element: node, data: node.data },
      });
      this._currFocusedNode = node;
    } else {
      node.setFocus();
      this._currFocusedNode = node;
      this.focusChanged.emit({
        oldValue: null,
        newValue: { element: node, data: node.data },
      });
    }
  }

  private _findSiblingAbove(): HTMLTfTreeviewItemElement | null {
    if (
      !this._currFocusedNode.parentElement ||
      !(this._currFocusedNode.parentElement.children.length > 1)
    ) {
      return null;
    }

    let prevSibiling = this._currFocusedNode.previousElementSibling;
    while (prevSibiling && prevSibiling.nodeName.toLowerCase() !== treeViewItemSelector) {
      prevSibiling = prevSibiling.previousElementSibling;
    }
    return prevSibiling as HTMLTfTreeviewItemElement;
  }

  private _focusNodeBelow(): void {
    if (!this._currFocusedNode) {
      return;
    }

    let nodeBelow: HTMLTfTreeviewItemElement | null = null;
    const currFocusedNodeChildren = this._filterAllTreeViewItemNodes(
      this._currFocusedNode.children
    );
    if (
      this._currFocusedNode.expanded &&
      currFocusedNodeChildren &&
      currFocusedNodeChildren.length > 0
    ) {
      // Highlight the first child of focussed node
      // Filter all children of type tf-treeview-item and set the nodeBelow to first child
      nodeBelow = currFocusedNodeChildren[0] as HTMLTfTreeviewItemElement;
    }

    // If no child node below
    if (!nodeBelow) {
      // Highlight the sibling node below
      nodeBelow = this._findNextSibling();
    }

    // If no next sibling node
    if (!nodeBelow) {
      // Highlight the next sibiling of the parent node which has sibling
      let currNode = this._currFocusedNode;
      while (!nodeBelow) {
        nodeBelow = this._findNextParentSibiling(currNode);
        currNode = currNode.parentElement as HTMLTfTreeviewItemElement;
      }
    }
    if (nodeBelow) {
      this._setFocusNode(nodeBelow);
    }
  }

  private _focusLastVisibleNode(): void {
    const rootNodes = this._filterAllTreeViewItemNodes(this._hostEl.children);
    if (!rootNodes || rootNodes.length == 0) {
      return;
    }
    let lastFocusNode = rootNodes[rootNodes.length - 1];
    const lastFocusNodeChildren = this._filterAllTreeViewItemNodes(lastFocusNode.children);
    if (
      !lastFocusNode.expanded ||
      (lastFocusNode.expanded && lastFocusNodeChildren && lastFocusNodeChildren.length === 0)
    ) {
      this._setFocusNode(lastFocusNode);
    } else {
      // Find the last visible node in the expanded heirarchy
      let childNodes = this._filterAllTreeViewItemNodes(lastFocusNode.children);
      if (childNodes && childNodes.length > 0) {
        lastFocusNode = childNodes[childNodes.length - 1];
      }

      while (
        childNodes &&
        childNodes.length > 0 &&
        childNodes[childNodes.length - 1].expanded &&
        this._filterAllTreeViewItemNodes(childNodes[childNodes.length - 1].children)!.length > 0
      ) {
        childNodes = this._filterAllTreeViewItemNodes(lastFocusNode.children);
        if (childNodes) {
          lastFocusNode = childNodes[childNodes.length - 1];
        }
      }
      if (lastFocusNode) {
        this._setFocusNode(lastFocusNode);
      }
    }
  }

  private _focusNodeAbove(): void {
    let nodeAbove: HTMLTfTreeviewItemElement | null = null;

    // If a sibling node exists above, focus that node
    nodeAbove = this._findSiblingAbove();
    if (nodeAbove) {
      const nodeAboveChildren = this._filterAllTreeViewItemNodes(nodeAbove.children);
      if (!nodeAbove.expanded || (nodeAbove.expandAll && nodeAboveChildren!.length === 0)) {
        // If nodeAbove has no children visible, set focus on that node
        this._setFocusNode(nodeAbove);
      } else {
        let prevChildNodes = this._filterAllTreeViewItemNodes(nodeAbove.children);
        if (prevChildNodes && prevChildNodes.length > 0) {
          // If prev child last node is not expanded, set focus to the last child node
          if (!prevChildNodes[prevChildNodes.length - 1].expanded) {
            this._setFocusNode(prevChildNodes[prevChildNodes.length - 1]);
          } else {
            // If nodeAbove is expanded, set focus on that last visible descendant child of the nodeAbove.
            // Find the last visible descendant child node and set focus to that
            let lNode = prevChildNodes[prevChildNodes.length - 1];
            let childCount = this._filterAllTreeViewItemNodes(lNode.children)!.length;
            while (lNode && lNode.expanded && childCount > 0) {
              const lchildren = this._filterAllTreeViewItemNodes(lNode.children);
              if (lchildren) {
                lNode = lchildren[lchildren.length - 1];
                childCount = this._filterAllTreeViewItemNodes(lNode.children)!.length;
              }
            }
            if (lNode) {
              this._setFocusNode(lNode);
            } else {
              this._setFocusNode(prevChildNodes[prevChildNodes.length - 1]);
            }
          }
        }
      }
    } else {
      // If no sibling node above, focus the parent node
      if (
        this._currFocusedNode.parentElement &&
        this._currFocusedNode.parentElement.nodeName.toLowerCase() === treeViewItemSelector
      ) {
        this._setFocusNode(this._currFocusedNode.parentElement as HTMLTfTreeviewItemElement);
      }
    }
  }

  private _findNextParentSibiling(
    focusedNode: HTMLTfTreeviewItemElement
  ): HTMLTfTreeviewItemElement | null {
    if (
      !focusedNode ||
      !focusedNode.parentElement ||
      !(focusedNode.parentElement.nodeName !== treeViewItemSelector)
    ) {
      return null;
    }

    let nextSibiling = focusedNode.parentElement.nextElementSibling as Element | null;
    while (nextSibiling && nextSibiling.nodeName.toLowerCase() !== treeViewItemSelector) {
      nextSibiling = nextSibiling.nextElementSibling;
    }
    return nextSibiling as HTMLTfTreeviewItemElement;
  }

  private _filterAllTreeViewItemNodes(
    nodes: HTMLCollection | null
  ): HTMLTfTreeviewItemElement[] | null {
    if (!nodes) {
      return null;
    }
    let treeNodes = [];
    const len = nodes.length;
    for (let i = 0; i < len; i++) {
      if (nodes[i].nodeName.toLowerCase() === treeViewItemSelector) {
        treeNodes.push(nodes[i]);
      }
    }
    return treeNodes as HTMLTfTreeviewItemElement[];
  }

  private _findNextSibling(): HTMLTfTreeviewItemElement | null {
    const allSiblingNodes = this._currFocusedNode!.parentNode!.children;

    if (allSiblingNodes.length == 0 || allSiblingNodes.length == 1) {
      return null; // No siblings exist
    }
    let nextSibiling = this._currFocusedNode.nextElementSibling as Element | null;

    while (nextSibiling && nextSibiling.nodeName.toLowerCase() !== treeViewItemSelector) {
      nextSibiling = nextSibiling.nextElementSibling;
    }
    return nextSibiling as HTMLTfTreeviewItemElement;
  }

  componentWillLoad() {
    if (this._hostEl.tabIndex < 0) {
      this._hostEl.tabIndex = 0;
    }
  }

  componentDidLoad() {
    console.log('componentDidRender');
    this._focusFirstVisibleNode();
  }

  render() {
    return (
      <Host class='curr-level'>
        <slot />
      </Host>
    );
  }
}

const treeViewItemSelector: string = 'tf-treeview-item';
class KeyCodes {
  public static ArrowUp = `ArrowUp`;
  public static ArrowDown = `ArrowDown`;
  public static ArrowRight = `ArrowRight`;
  public static ArrowLeft = `ArrowLeft`;
  public static Enter = `Enter`;
  public static Home = `Home`;
  public static End = `End`;
}
