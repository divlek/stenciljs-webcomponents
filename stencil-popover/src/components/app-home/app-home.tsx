import { Component, h, Element, State } from '@stencil/core';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss',
  shadow: true
})
export class AppHome {

  @Element() el: HTMLElement;

  private _appendedArrow: boolean = false;
  @State() private _showPopupHeader: boolean = false;
  @State() private _showPopupBtn1: boolean = false;
  @State() private _showPopupBtn2: boolean = false;
  @State() private _showPopupInputText: boolean = false;
  @State() private _showPopupInputRange: boolean = false;
  @State() private _showPopupBtnMenu: boolean = false;
  @State() private _showPopupLink1: boolean = false;
  @State() private _showPopupLink2: boolean = false;
  @State() private _showPopupLink3: boolean = false;
  @State() private _showPopupBtnNew: boolean = false;
  @State() private _showPopupMySmallComponent: boolean = false;
  @State() private _showSubMenu1: boolean = false;

  componentDidLoad() {
    /*
    const ref = this.el.shadowRoot.querySelector('.profile-page-btn');
    const pop = this.el.shadowRoot.querySelector('.my-popper');
    // this.appendToBody(pop);
    
    const popper = new Popper(ref, pop, {
      placement: 'right'
    });
    
    this.appendArrow(pop);
    */
    
  }

  appendToBody(pop) {
    document.body.appendChild(pop);
  }

  

  appendArrow(element) {
    if (this._appendedArrow) {
      return;
    }
    
    // this.appendedArrow = true;
    const arrow = document.createElement('div');
    arrow.setAttribute('x-arrow', '');
    arrow.className = 'popper__arrow';
    element.appendChild(arrow);
    this._appendedArrow = true;
  }

  showPopUp = (id: string) => {
    if (id === 'header') {
      this._showPopupHeader = true;
    } else if (id === 'btn1' ) {
      this._showPopupBtn1 = true;
    } else if (id === 'btn2' ) {
      this._showPopupBtn2 = true;
    } else if (id === 'inputText' ) {
      this._showPopupInputText = true;
    } else if (id === 'inputRange' ) {
      this._showPopupInputRange = true;
    } else if (id === 'link1' ) {
      this._showPopupLink1 = true;
    } else if (id === 'link2' ) {
      this._showPopupLink2 = true;
    } else if (id === 'link3' ) {
      this._showPopupLink3 = true;
    } else if (id === 'mySmallComponent' ) {
      this._showPopupMySmallComponent = true;
    } else if (id === 'btnNew') {
      this._showPopupBtnNew = true;
    } else if (id === 'btnMenu') {
      this._showPopupBtnMenu = true;
    } else if (id === 'subMenu1') {
      this._showSubMenu1 = true;
    }
  }

  hidePopUp = (id: string) => {
    if (id === 'header') {
      this._showPopupHeader = false;
    } else if (id === 'btn1' ) {
      this._showPopupBtn1 = false;
    } else if (id === 'btn2' ) {
      this._showPopupBtn2 = false;
    } else if (id === 'inputText' ) {
      this._showPopupInputText = false;
    } else if (id === 'inputRange' ) {
      this._showPopupInputRange = false;
    } else if (id === 'link1' ) {
      this._showPopupLink1 = false;
    } else if (id === 'link2' ) {
      this._showPopupLink2 = false;
    } else if (id === 'link3' ) {
      this._showPopupLink3 = false;
    } else if (id === 'mySmallComponent' ) {
      this._showPopupMySmallComponent = false;
    } else if (id === 'btnNew') {
      this._showPopupBtnNew = false;
    } else if (id === 'btnMenu') {
      this._showPopupBtnMenu = false;
    } else if (id === 'subMenu1') {
      this._showSubMenu1 = false;
    }
  }


  public showPopUpDynamically(ev : MouseEvent) {
    console.log(ev);
    console.log( (ev.target instanceof HTMLElement) ? true : false);
    const eventTarget = ev.target as any as HTMLElement;
    let popOverElement = document.createElement('tf-popover') as HTMLTfPopoverElement;
    popOverElement.for = eventTarget;
    popOverElement.placement = 'top';
    popOverElement.addEventListener('closed', () =>  popOverElement.remove());
    popOverElement.insertAdjacentHTML('beforeend', 
    `<div class="dropdown-content">
        <a class="home">Home</a>
        <a class="about">About</a>
        <a class= "contact">Contact</a>
     </div> 
    `);
    popOverElement.querySelector('.home').addEventListener('click',() => alert('Home clicked'));
    popOverElement.querySelector('.about').addEventListener('click',() => alert('About clicked'));
    popOverElement.querySelector('.contact').addEventListener('click',() => alert('Contact clicked'));
    eventTarget.parentNode.insertBefore(popOverElement, null);    
  }

  changeVisibility = () => {
   this._showPopupBtnNew = !this._showPopupBtnNew ;
    /* 
    const popovers = this.el.querySelectorAll(`[for='#target']`);
    popovers.forEach(
      (popover : any) => { popover.hidden = !popover.hidden; });
      */
      
  }

  onClickHandler = () => {
    alert('Hello world');
  }

  render() {
    return (
      <div class='app-home'>
        <p>
          Welcome to the Stencil App Starter.
          You can use this starter to build entire apps all with
          web components using Stencil!
          Check out our docs on <a href='https://stenciljs.com'>stenciljs.com</a> to get started.
        </p>                  
        <div class='demo-popup'>              
          <div class='fixed-header' slot="reference" id="header" onMouseEnter={() => this.showPopUp("header")} onMouseLeave={() => this.hidePopUp("header")}>
                Fixed header testing -> Hover to show pop-over..
          </div>
          {this._showPopupHeader && (
          <tf-popover for="#header" placement="top" onClosed={() => this.hidePopUp("header")}>
              This is the popover content
          </tf-popover>
          )}
                    
          {/* First Row */}
          <div class='row'>
            <button class='profile-page-btn' id="btn1" onClick={() => this.showPopUp("btn1")} >
                Popover test -Click Me
            </button>
            {this._showPopupBtn1 && (
              <tf-popover for="#btn1" placement="bottom" onClosed={() => this.hidePopUp("btn1")} >                                  
                    <div class="my-popup">
                        Here is my popup!!
                        <div>This is some content</div>
                        <div>And More!</div>
                        <select title="Gotta make a choice here" >
                          <option selected>One</option>
                          <option>Two</option>
                        </select> 
                        <div>
                        <button onClick={() =>  this.hidePopUp("btn1")}>Close</button>
                        </div>
                        
                    </div>                 
              </tf-popover>
            )}

            <button class='profile-page-btn' id="btn2" onMouseEnter={() => this.showPopUp("btn2")} >
                Popover test one more - Hover over
            </button>
            {this._showPopupBtn2 && (
              <tf-popover for="#btn2" placement="right"  
                  onClosed={() => this.hidePopUp("btn2")}>                 
                  This is the btn2 popover content with shadow dom component
                  <my-small-component></my-small-component>                    
              </tf-popover>            
            )}          
          </div>
          {/* Second Row */}
          <div class='row row2'>
            <input type='text' id='inputText' onClick={() => this.showPopUp("inputText")}/>
            {this._showPopupInputText && (
              <tf-popover for="#inputText" placement="bottom" 
                  onClosed={() => this.hidePopUp("inputText")}>                   
                    Here is my popup for input text!!
              </tf-popover>           
             )} 
            <input type='range' id='inputRange' onClick={() => this.showPopUp("inputRange")}/>  
            {this._showPopupInputRange && (
              <tf-popover for='#inputRange' placement='top' 
                  onClosed={() => this.hidePopUp("inputRange")}>                      
                  <div onClick={this.onClickHandler}> 
                      I am a range selector !! 
                  </div >              
              </tf-popover>   
            )}        
            <my-small-component id="my-comp" onClick={() => this.showPopUp("mySmallComponent")}></my-small-component>  
            {this._showPopupMySmallComponent && (
              <tf-popover for='#my-comp' placement='top' 
                          onClosed={() => this.hidePopUp("mySmallComponent")} >                          
                  Works with a shadow dom component !!                  
              </tf-popover>   
            )}                                  
          </div>
           {/* Third Row */}
           <div class='row row3'>
              <button class="profile-page-btn" id="btnMenu" onClick={() => this.showPopUp("btnMenu")}>Context Menu</button>  
              {this._showPopupBtnMenu && (
                <tf-popover for='#btnMenu' placement='right' onClosed={() => this.hidePopUp("btnMenu")} >                     
                  <div class="dropdown-content">
                        <a id="home" href="#home" onMouseEnter={() => this.showPopUp("subMenu1")} onMouseLeave={() => this.hidePopUp("subMenu1")} onClick={() => alert('Home clicked')}> 
                          Home 
                        </a>
                        {/*
                        {this._showSubMenu1 && (
                          <tf-popover for='#home' placement='right' onClosed={() => this.hidePopUp("subMenu1")} > 
                              <div class="dropdown-content">
                                  <a href="#">SubMenu 1</a>
                                  <a href="#">SubMenu 2</a>
                              </div>
                          </tf-popover>
                        )}  
                        */ }                         
                        <a href="#about" onClick={() => alert('About clicked')}>About</a>
                        <a href="#contact" onClick={() => alert('Contact clicked')}>Contact</a>
                  </div>                 
                </tf-popover>               
               )}                      

              <button class="profile-page-btn" id="btnMenu2" onClick={(event) => this.showPopUpDynamically(event)}>Context Menu Programmatically</button> 
          </div>
           {/* Fourth Row */}
           <div class='row row3'>
              <a href="#" class="link" id="link1" onClick={() => this.showPopUp("link1")}>Left</a>  
              {this._showPopupLink1 && (
              <tf-popover for='#link1' placement='left' onClosed={() => this.hidePopUp("link1")} >   
                  Left !!                 
              </tf-popover>               
               )}   

              <a href="#" class="link" id="link2" onMouseOver={() => this.showPopUp("link2")} onMouseLeave={() => this.hidePopUp("link2")}>
                Middle</a>
              {this._showPopupLink2 && (
                <tf-popover for='#link2' placement='left'>    
                  Middle link !!                
                </tf-popover>               
               )}  

              <a href="#" class="link" id="link3" onClick={() => this.showPopUp("link3")}>Right</a>
              {this._showPopupLink3 && (
                <tf-popover for='#link3' placement='right' onClosed={() => this.hidePopUp("link3")} >  
                  Right link !!               
                </tf-popover>                 
              )}                                          
          </div>
        </div>
        <div class="scroll-container">
          <div id="target" onClick={() => this.showPopUp("btnNew")}>
              Click Me!
          </div>
        </div>
        {this._showPopupBtnNew && (
        <tf-popover for="#target" placement="top" 
            onClosed={() => this.hidePopUp("btnNew")} 
            >
              This is the popover content
        </tf-popover>
         )}
        {this._showPopupBtnNew && (
        <tf-popover for="#target" placement="left" 
            onClosed={() => this.hidePopUp("btnNew")} 
            >
              This is the popover content
        </tf-popover>
        )}
      </div>
    );
  }  
  
}
