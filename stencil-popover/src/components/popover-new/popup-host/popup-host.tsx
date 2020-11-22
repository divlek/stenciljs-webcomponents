import { h, Component, Element, Prop, Listen, Event, EventEmitter, Host } from '@stencil/core';

@Component({
    tag: 'tf-popup-host',
    styleUrl: 'popup-host.scss',        
})
export class PopupHost {
    @Element() private _element!: HTMLElement;

    @Prop() closeOnClickOut: boolean = true;

    @Prop({ reflect: true, attr: 'show-arrow' }) showArrow: boolean = true;

    @Event({ cancelable: false, bubbles: true }) closed!: EventEmitter<void>;

    // Capture mousedown at the windows level to dismiss popup if needed.
    @Listen('mousedown', { target: 'window', capture: true, passive: true })
    @Listen('touchstart', { target: 'window', capture: true, passive: true })
    captureGlobalMouseDown(e: MouseEvent | TouchEvent): void {
        if (!this.closeOnClickOut || e.target === this._element || this._element.contains(e.target as Node)) return;
        this.closed.emit();
    }

    componentWillLoad(): void {
        // document.body.appendChild(this._element);
    }

    render() {
        return (
            <Host>
                {this.showArrow && <div x-arrow />}
                <slot />
            </Host>
        );
    }
}