import {
  Component,
  h,
  Prop,
  Element,
  State,
  Watch,
  Listen,
  Event,
  EventEmitter
} from '@stencil/core';
import Popper, { PopperOptions, Placement, Data } from 'popper.js';

/**
 * This component is used to display a popover content relative to a specified element.
 * Used for popups and tooltips. The content can be plain text or customized html input.
 * The display of the popover component can be controlled using click, hover etc
 * Uses PopperJs package for positioning engine
 */
@Component({
  tag: 'tf-popover',
  styleUrl: 'popover.scss',
  shadow: true
})
export class Popover {
  /**
   * This property is used to set the selection string of target element.
   * For eg:- '#my-div'
   */
  @Prop() for:  HTMLElement | string = '';

  /**
   * This property is used to set the positioning of the popover
   */
  @Prop() placement: 'top' | 'right' | 'bottom' | 'left' = 'bottom';

  /**
   * Used to adjust the zIndex
   */
  @Prop() zIndex = 999;

  /**
   * This event will be thrown when user clicks anywhere outside the popover content
   */
  @Event({ cancelable: false, bubbles: true }) closed!: EventEmitter<void>;

  @Element() private _element!: HTMLElement;
  @State() private _popperPlacement: string = this.placement;
  private _target: Element | undefined;
  private _popOverElement!: Element;
  private _popperObject: Popper | undefined;
  private _originalRoot!: Element;
  private _popperOptions: PopperOptions | undefined;

  @Watch('placement')
  placementChanged(newValue: string) {
    if (this._popperObject) {
      this._popperObject.options['placement'] = newValue as Placement;
      this._updatePopper();
    }
  }

  @Watch('for')
  forChanged(newValue: HTMLElement | string, oldValue: HTMLElement | string) {

    let foundTarget = null;
    if (newValue instanceof HTMLElement) {
      foundTarget = newValue;
    } else {
      if (newValue && newValue.length > 0) {
        // Search within the previously saved parent root node
          foundTarget = this._originalRoot.querySelector(newValue) || undefined;
        if (foundTarget === this._target) {
          return;
        }           
      } else {
        this.for = oldValue;
        console.error(`<tf-popover>: Invalid for value.`);
      }
    }

    if (foundTarget) {
      this._target = foundTarget;
      if (this._popperObject) {
        this._popperObject.destroy();
        this._popperObject = new Popper(
          this._target,
          this._popOverElement,
          this._popperOptions
        );
      } else {
        this.for = oldValue;
        console.error('<tf-popover>: _popperObject not set.');
      }
    } else {
      this.for = oldValue;
      console.error(
        `<tf-popover>: The popover target not found ` +
        `within the same root as previous for element.`
      );
    }
  }

  // Capture the mousedown/ touchdown event at the windows level to emit the close event.
  @Listen('mousedown', { target: 'window', capture: true, passive: true })
  captureGlobalClick(e: MouseEvent | TouchEvent): void {
    if (e.target === this._element || this._element.contains(e.target as Node))
      return;
    this.closed.emit();
  }

  componentDidLoad() {
    this._generatePopper();
  }

  getPopoverContentClass(): string {
    return 'popover-content';
  }

  getZIndexStyle(): { [key: string]: string } {
    return { 'z-index': `${this.zIndex}` };
  }

  render() {
    return (
      <div
        id="popover"
        ref={el => (this._popOverElement = el as HTMLElement)}
        class={this._getPopoverContainerClass()}
        style={this.getZIndexStyle()}
      >        
        <div
          class={this.getPopoverContentClass()}
          style={this.getZIndexStyle()}
        >
          <slot />
        </div>
      </div>
    );
  }

  private _generatePopper(): void {
    this._findTarget();
    this._copyStylesFromParentShadowDom();
    this._attachToDocumentBody();

    this._popperOptions = {
      placement: this.placement,
      removeOnDestroy: true,
      onCreate: (data: Data) => {
        return this._updatePopperPlacement(data);
      },
      onUpdate: (data: Data) => {
        return this._updatePopperPlacement(data);
      }
    };

    if (this._target && this._popOverElement) {
      this._popperObject = new Popper(
        this._target,
        this._popOverElement,
        this._popperOptions
      );
    } else {
      console.error('<tf-popover>: Invalid target.');
    }
  }

  private _findTarget(): void {
    if (this.for) {
      // Save the original root (which can be shadow root or document root)
      this._originalRoot = (this._element.getRootNode() as any) as Element;
      
      let foundTarget = null;
      if (this.for instanceof HTMLElement) {
        foundTarget = this.for;
      } else {
        // Search for the target element within the current shadow root
       foundTarget = this._originalRoot.querySelector(this.for) || undefined;
      }      
      if (foundTarget) {
        this._target = foundTarget;
      } else {
        console.error(
          `<tf-popover>: The popover target ${this.for} not found.`
        );
      }
    }
  }

  private _attachToDocumentBody(): void {
    document.body.appendChild(this._element);    
  }

  private _copyStylesFromParentShadowDom(): void {
    // If the target is under a shadow root (not under document root),
    // copy the styles from the target's parent root,
    // append it to popover component's style after mapping the rules to apply if descendant of tf-popover
    if (this._originalRoot !== document.body) {
      // Get the stylesheets from _originalRoot
      const styleSheets = ((this._originalRoot as any) as DocumentOrShadowRoot).styleSheets;
      let mappedCssText = ``;
      if (styleSheets) {
        for (let i = 0; i < styleSheets.length; i++) {        
          const styleSheet = styleSheets[i] as CSSStyleSheet;
          const rules =
            styleSheet.rules || ((styleSheet.cssRules as any) as CSSRuleList);
            for (let j = 0; j < rules.length; j++) {          
                // Map the css rules only apply if content of tf-popover
                mappedCssText = mappedCssText + `tf-popover ${rules[j].cssText}  \n`;
          }
        }
      }      
      // Create a style tag and append as child to popover element
      let css = document.createElement('style');
      css.type = 'text/css';      
      css.textContent = mappedCssText;
      this._element.appendChild(css);
    }

  }

  private _getPopoverContainerClass(): string {
    let append = '';
    append = (!this._popperPlacement) ? (append +' fade-out') : (append + ' fade-in');
    return 'popover-container-' + this._popperPlacement + append;
  }


  private _updatePopper(): void {
    if (this._popperObject) {
      this._popperObject.scheduleUpdate();
    }
  }

  private _updatePopperPlacement(data: Data): void {
    if (data && data.placement) {
      if (this._popperPlacement !== data.placement) {
        this._popperPlacement = data.placement;
      }
    }
  }
}
