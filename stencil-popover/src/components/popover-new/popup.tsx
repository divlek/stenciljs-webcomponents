import { Component, Prop, Element, Event, EventEmitter, Watch } from '@stencil/core';
import Popper from 'popper.js';

const ShadowHostTag = 'tfiu-shadow-host';

if (!window.customElements.get(ShadowHostTag)) {
    /**
     * An internal web component that can be used to build a shadow DOM wrapped fragment of CSS and HTML.
     * The immediate children of this element will be moved into it's shadow root when the element is first attached to the DOM.
     * This can be used for specialized render functions in a shadow DOM encapsulated web component to encapsulate styling.
     */
    class HTMLShadowHostElement extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }

        connectedCallback() {
            // Reparent the element's immediate children to be within our shadow root.
            const root = this.shadowRoot!;
            const children = Array.from(this.children);
            for (const child of children) {
                root.appendChild(child);
            }
        }
    }

    window.customElements.define(ShadowHostTag, HTMLShadowHostElement);
}

@Component({
    tag: 'tf-popup',
    styles: `tf-popup{display:none}`
})
export class Popup {
    @Element() private _element!: HTMLElement;
    private _children: Array<Node> = [];
    private _popper: Popper | null = null;

    @Event({ cancelable: false, bubbles: true }) closed!: EventEmitter<void>;

    @Prop() relativeTo?: HTMLElement | string | { clientHeight: number, clientWidth: number, getBoundingClientRect(): ClientRect };

    @Prop() closeOnClickOut: boolean = true;

    @Prop() showArrow: boolean = true;

    @Prop() placement?: 'auto-start' | 'auto' | 'auto-end' | 'top-start' | 'top' | 'top-end' | 'right-start' | 'right'
        | 'right-end' | 'bottom-end' | 'bottom' | 'bottom-start' | 'left-end' | 'left' | 'left-start' = 'auto';

    @Watch('relativeTo')
    protected _relativeToWatch(): void {
        this._showPopup();
    }

    private _getReference(): HTMLElement | Popper.ReferenceObject {
        let reference: HTMLElement | Popper.ReferenceObject | undefined;

        if (this.relativeTo instanceof HTMLElement) {
            reference = this.relativeTo;
        } else {
            switch (typeof this.relativeTo) {
                case 'string':
                    const root = this._element.getRootNode() as any as ParentNode;
                    reference = root.querySelector(this.relativeTo) || undefined;
                    break;
                case 'object':
                    reference = this.relativeTo;
                    break;
                default:
                    reference = {
                        clientWidth: 1,
                        clientHeight: 1,
                        getBoundingClientRect: () => {
                            const rect = new ClientRect();
                            rect.left = 0;
                            rect.top = 0;
                            rect.bottom = 1;
                            rect.right = 1;
                            return rect;
                        }
                    };
                    break;
            }
        }

        return reference!;
    }

    private _closedHandler = () => this.closed.emit();

    private _updatePopup = () => {
        if (this._popper) {
            this._popper.update();
        }
    };

    private _showPopup(): void {
        this._hidePopup();
        const host = document.createElement('tf-popup-host');
        host.showArrow = this.showArrow;
        host.closeOnClickOut = this.closeOnClickOut;
        host.addEventListener('closed', this._closedHandler);
        const reference = this._getReference();
        const options = {
            removeOnDestroy: true,
            placement: this.placement,
        };

        this._children = Array.from(this._element.childNodes);
        this._children.forEach((c) => host.appendChild(c));
    
        
        const encapsulatedDom = document.createElement(ShadowHostTag);
        encapsulatedDom.appendChild(host);
        document.body.appendChild(encapsulatedDom);
        this._popper = new Popper(reference, encapsulatedDom, options);
        
        
       /*
       document.body.appendChild(host);
       this._popper = new Popper(reference, host, options);
       */
       
        
        // Handle the case that sometimes the placement is not spot on. This may be due to order of rendering.
        //setTimeout(this._updatePopup, 40);
    }

    private _hidePopup(): void {
        if (this._children.length > 0) {
            const host = this._element;
            this._children.forEach((c) => host.appendChild(c));
            this._children = [];
        }

        if (this._popper) {
            this._popper.destroy();
            this._popper = null;
        }
    }

    componentDidLoad(): void {
        this._showPopup();
    }

    componentDidUnload(): void {
        this._hidePopup();
    }
}
